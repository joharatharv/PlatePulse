"""
PlatePulse - Flask Backend Server
Connects to MongoDB and provides REST API for the frontend.

Run: python backend/server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta
import os

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, use system environment variables

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# MongoDB Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "platepulse"

# Initialize MongoDB client with robust connection options for Atlas
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,  # 5 second timeout for server selection
        connectTimeoutMS=10000,  # 10 second connection timeout
        socketTimeoutMS=None,  # No socket timeout
        maxPoolSize=50,  # Connection pool size
        retryWrites=True,  # Enable retry writes
        w='majority'  # Write concern for durability
    )
    # Test the connection
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    client = None

db = client[DATABASE_NAME] if client is not None else None

# Collections
users_collection = db["users"] if db is not None else None
meals_collection = db["meals"] if db is not None else None
summaries_collection = db["daily_summaries"] if db is not None else None
food_db_collection = db["food_database"] if db is not None else None
posts_collection = db["posts"] if db is not None else None


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    if "userId" in doc and isinstance(doc["userId"], ObjectId):
        doc["userId"] = str(doc["userId"])
    if "date" in doc and isinstance(doc["date"], datetime):
        doc["date"] = doc["date"].isoformat()
    if "logged_at" in doc and isinstance(doc["logged_at"], datetime):
        doc["logged_at"] = doc["logged_at"].isoformat()
    return doc


def get_valid_user_object_id(user_id):
    """
    Get a valid MongoDB ObjectId for a user.
    If user_id is invalid or not a proper ObjectId, falls back to demo user.
    Returns tuple of (ObjectId, error_message). error_message is None if successful.
    """
    # If no user_id provided, use demo user
    if not user_id or user_id == "null" or user_id == "undefined" or user_id == "None":
        demo_user = users_collection.find_one({"email": "demo@platepulse.app"})
        if demo_user:
            return demo_user["_id"], None
        return None, "Demo user not found. Run init_db.py first."
    
    # Try to convert to ObjectId
    try:
        return ObjectId(user_id), None
    except (InvalidId, TypeError):
        # Invalid ObjectId format - try to find demo user instead
        demo_user = users_collection.find_one({"email": "demo@platepulse.app"})
        if demo_user:
            return demo_user["_id"], None
        return None, "Invalid user ID and demo user not found."


# ============== User Routes ==============

def calculate_weight_loss_calories(age, gender, height, weight, activity_level):
    """Harris-Benedict BMR with 500 kcal/day weight-loss deficit"""
    try:
        age, height, weight = float(age), float(height), float(weight)
        if gender == 'male':
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
        multipliers = {
            'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55,
            'active': 1.725, 'very_active': 1.9
        }
        tdee = bmr * multipliers.get(activity_level, 1.55)
        return max(1200, round(tdee - 500))
    except (TypeError, ValueError):
        return 1800


@app.route("/api/users", methods=["POST"])
def register_user():
    """Register a new user from onboarding"""
    try:
        data = request.json
        doctor = data.get("doctorGoals", {})

        # Derive calorie goal: doctor override → BMR calculation → fallback
        calorie_goal = (
            int(doctor.get("caloricLimit")) if doctor.get("caloricLimit")
            else calculate_weight_loss_calories(
                data.get("age"), data.get("gender"),
                data.get("height"), data.get("currentWeight"),
                data.get("activityLevel")
            )
        )

        now = datetime.utcnow()
        user = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "profile": {
                "age": data.get("age"),
                "gender": data.get("gender"),
                "height": data.get("height"),
                "weight": data.get("currentWeight"),
                "startWeight": data.get("currentWeight"),  # baseline — never overwritten
                "activityLevel": data.get("activityLevel", "moderate"),
            },
            "targetWeight": data.get("targetWeight"),
            "chronicConditions": data.get("chronicConditions", []),
            "doctorGoals": {
                "caloricLimit": doctor.get("caloricLimit") or None,
                "sodiumLimit": doctor.get("sodiumLimit") or None,
                "sugarLimit": doctor.get("sugarLimit") or None,
                "carbLimit": doctor.get("carbLimit") or None,
                "proteinTarget": doctor.get("proteinTarget") or None,
                "fiberTarget": doctor.get("fiberTarget") or None,
                "waterIntake": doctor.get("waterIntake") or None,
                "foodsToAvoid": doctor.get("foodsToAvoid", ""),
                "specialWarnings": doctor.get("specialWarnings", ""),
            },
            "goals": {
                "calories": calorie_goal,
                "protein": int(doctor.get("proteinTarget") or 60),
                "carbs": int(doctor.get("carbLimit") or 250),
                "fat": 65,
                "fiber": 30,
                "sugar": int(doctor.get("sugarLimit") or 50),
            },
            "preferences": {
                "dietType": data.get("dietType", "non-vegetarian"),
                "allergies": data.get("allergies", []),
                "cuisinePreference": ["North Indian", "South Indian"],
            },
            "created_at": now,
            "updated_at": now,
        }

        result = users_collection.insert_one(user)
        user["_id"] = result.inserted_id
        return jsonify(serialize_doc(user)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    """Update user profile (for Settings screen)"""
    try:
        data = request.json
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            return jsonify({"error": error}), 404

        allowed = ["name", "email", "profile", "goals", "targetWeight",
                   "chronicConditions", "doctorGoals", "preferences"]
        update_fields = {"updated_at": datetime.utcnow()}
        for field in allowed:
            if field in data:
                update_fields[field] = data[field]

        users_collection.update_one({"_id": obj_id}, {"$set": update_fields})
        updated = users_collection.find_one({"_id": obj_id})
        return jsonify(serialize_doc(updated))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """Get user by ID"""
    try:
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            return jsonify({"error": error}), 404
        
        user = users_collection.find_one({"_id": obj_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(serialize_doc(user))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/demo", methods=["GET"])
def get_demo_user():
    """Get the demo user for testing"""
    try:
        user = users_collection.find_one({"email": "demo@platepulse.app"})
        if not user:
            return jsonify({"error": "Demo user not found. Run init_db.py first."}), 404
        return jsonify(serialize_doc(user))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============== Meals Routes ==============

@app.route("/api/meals", methods=["GET"])
def get_meals():
    """Get meals for a user on a specific date"""
    try:
        user_id = request.args.get("userId")
        date_str = request.args.get("date")
        
        # Get valid ObjectId (falls back to demo user if invalid)
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            return jsonify([])  # Return empty array if no valid user
        
        # Parse date or use today
        if date_str:
            date = datetime.fromisoformat(date_str.replace("Z", ""))
        else:
            date = datetime.utcnow()
        
        # Get start and end of day
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Query meals
        meals = list(meals_collection.find({
            "userId": obj_id,
            "date": {"$gte": start_of_day, "$lt": end_of_day}
        }).sort("logged_at", 1))
        
        return jsonify([serialize_doc(meal) for meal in meals])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/meals", methods=["POST"])
def log_meal():
    """Log a new meal"""
    try:
        data = request.json
        
        user_id = data.get("userId")
        # Get valid ObjectId (falls back to demo user if invalid)
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            print("hi")
            return jsonify({"error": error}), 400
        
        # Create meal document
        now = datetime.utcnow()
        meal = {
            "userId": obj_id,
            "name": data.get("name"),
            "mealType": data.get("mealType"),
            "calories": data.get("calories"),
            "nutrition": data.get("nutrition", {}),
            "items": data.get("items", []),
            "image": data.get("image"),
            "date": now.replace(hour=0, minute=0, second=0, microsecond=0),
            "time": now.strftime("%H:%M"),
            "logged_at": now
        }
        
        result = meals_collection.insert_one(meal)
        meal["_id"] = result.inserted_id
        
        # Update daily summary
        update_daily_summary(obj_id, meal["date"])
        # print("Meal logged successfully:", meal)
        return jsonify({
            "success": True,
            "meal": serialize_doc(meal)
        }), 201
    except Exception as e:
        print("error logging meal:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/meals/<meal_id>", methods=["DELETE"])
def delete_meal(meal_id):
    """Delete a meal"""
    try:
        meal = meals_collection.find_one({"_id": ObjectId(meal_id)})
        if not meal:
            return jsonify({"error": "Meal not found"}), 404
        
        meals_collection.delete_one({"_id": ObjectId(meal_id)})
        
        # Update daily summary
        update_daily_summary(meal["userId"], meal["date"])
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============== Summary Routes ==============

@app.route("/api/summary", methods=["GET"])
def get_daily_summary():
    """Get daily nutrition summary for a user"""
    try:
        user_id = request.args.get("userId")
        date_str = request.args.get("date")
        
        # Get valid ObjectId (falls back to demo user if invalid)
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            return jsonify({
                "date": datetime.utcnow().isoformat(),
                "consumed": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
                "remaining": {"calories": 2000, "protein": 60, "carbs": 300, "fat": 65},
                "mealsLogged": 0,
                "waterIntake": 0
            })
        
        # Parse date or use today
        if date_str:
            date = datetime.fromisoformat(date_str.replace("Z", ""))
        else:
            date = datetime.utcnow()
        
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get or create summary
        summary = summaries_collection.find_one({
            "userId": obj_id,
            "date": start_of_day
        })
        
        if not summary:
            # Calculate from meals
            summary = calculate_daily_summary(obj_id, start_of_day)
        
        return jsonify(serialize_doc(summary) if summary else {
            "date": start_of_day.isoformat(),
            "consumed": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
            "remaining": {"calories": 2000, "protein": 60, "carbs": 300, "fat": 65},
            "mealsLogged": 0,
            "waterIntake": 0
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/weekly", methods=["GET"])
def get_weekly_data():
    """Get weekly calorie data for charts"""
    try:
        user_id = request.args.get("userId")
        
        # Get valid ObjectId (falls back to demo user if invalid)
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            return jsonify([])
        
        # Get user's calorie goal
        user = users_collection.find_one({"_id": obj_id})
        calorie_goal = user.get("goals", {}).get("calories", 2000) if user else 2000
        
        # Get last 7 days of data
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        weekly_data = []
        day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            
            # Aggregate calories for this day
            pipeline = [
                {
                    "$match": {
                        "userId": obj_id,
                        "date": date
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "totalCalories": {"$sum": "$calories"}
                    }
                }
            ]
            
            result = list(meals_collection.aggregate(pipeline))
            calories = result[0]["totalCalories"] if result else 0
            
            weekly_data.append({
                "day": day_names[date.weekday()],
                "calories": calories,
                "goal": calorie_goal
            })
        
        return jsonify(weekly_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============== Goals Routes ==============

@app.route("/api/goals", methods=["PUT"])
def update_goals():
    """Update user's nutrition goals"""
    try:
        data = request.json
        user_id = data.get("userId")
        
        # Get valid ObjectId (falls back to demo user if invalid)
        obj_id, error = get_valid_user_object_id(user_id)
        if error:
            return jsonify({"error": error}), 400
        
        goals = {
            "calories": data.get("calories", 2000),
            "protein": data.get("protein", 60),
            "carbs": data.get("carbs", 300),
            "fat": data.get("fat", 65),
            "fiber": data.get("fiber", 30),
            "sugar": data.get("sugar", 50)
        }
        
        users_collection.update_one(
            {"_id": obj_id},
            {"$set": {"goals": goals, "updated_at": datetime.utcnow()}}
        )
        
        return jsonify({"success": True, "goals": goals})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============== Food Database Routes ==============

@app.route("/api/foods", methods=["GET"])
def search_foods():
    """Search Indian food database"""
    try:
        query = request.args.get("q", "")
        category = request.args.get("category")
        tag = request.args.get("tag")
        
        filter_query = {}
        
        if query:
            filter_query["name"] = {"$regex": query, "$options": "i"}
        if category:
            filter_query["category"] = category
        if tag:
            filter_query["tags"] = tag
        
        foods = list(food_db_collection.find(filter_query).limit(20))
        return jsonify([serialize_doc(food) for food in foods])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/foods/<food_id>", methods=["GET"])
def get_food(food_id):
    """Get food item by ID"""
    try:
        food = food_db_collection.find_one({"_id": ObjectId(food_id)})
        if not food:
            return jsonify({"error": "Food not found"}), 404
        return jsonify(serialize_doc(food))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============== Helper Functions ==============

def calculate_daily_summary(user_obj_id, date):
    """Calculate daily summary from meals"""
    user = users_collection.find_one({"_id": user_obj_id})
    goals = user.get("goals", {
        "calories": 2000, "protein": 60, "carbs": 300, "fat": 65
    }) if user else {"calories": 2000, "protein": 60, "carbs": 300, "fat": 65}
    
    pipeline = [
        {
            "$match": {
                "userId": user_obj_id,
                "date": date
            }
        },
        {
            "$group": {
                "_id": None,
                "totalCalories": {"$sum": "$calories"},
                "totalProtein": {"$sum": "$nutrition.protein"},
                "totalCarbs": {"$sum": "$nutrition.carbs"},
                "totalFat": {"$sum": "$nutrition.fat"},
                "totalSugar": {"$sum": "$nutrition.sugar"},
                "totalFiber": {"$sum": "$nutrition.fiber"},
                "mealsCount": {"$sum": 1}
            }
        }
    ]

    result = list(meals_collection.aggregate(pipeline))

    if result:
        consumed = result[0]
        return {
            "_id": ObjectId(),
            "userId": user_obj_id,
            "date": date,
            "consumed": {
                "calories": consumed["totalCalories"],
                "protein": round(consumed["totalProtein"], 1),
                "carbs": round(consumed["totalCarbs"], 1),
                "fat": round(consumed["totalFat"], 1),
                "sugar": round(consumed.get("totalSugar", 0), 1),
                "fiber": round(consumed.get("totalFiber", 0), 1),
            },
            "remaining": {
                "calories": max(0, goals["calories"] - consumed["totalCalories"]),
                "protein": max(0, goals["protein"] - consumed["totalProtein"]),
                "carbs": max(0, goals["carbs"] - consumed["totalCarbs"]),
                "fat": max(0, goals["fat"] - consumed["totalFat"])
            },
            "mealsLogged": consumed["mealsCount"],
            "waterIntake": 0
        }
    return None


def update_daily_summary(user_obj_id, date):
    """Update or create daily summary after meal changes"""
    summary = calculate_daily_summary(user_obj_id, date)
    if summary:
        summary["updated_at"] = datetime.utcnow()
        # Remove _id from summary before update to avoid "immutable field '_id'" error
        summary.pop("_id", None)
        summaries_collection.update_one(
            {"userId": user_obj_id, "date": date},
            {"$set": summary},
            upsert=True
        )


# ============== Health Check ==============

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        client.admin.command('ping')
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    print("\n🍽️  PlatePulse Backend Server")
    print("=" * 40)
    print(f"MongoDB URI: {MONGO_URI}")
    print(f"Database: {DATABASE_NAME}")
    print("\nStarting server on http://localhost:5001")
    print("API Documentation:")
    print("  GET  /api/health     - Health check")
    print("  GET  /api/users/demo - Get demo user")
    print("  GET  /api/meals      - Get meals for date")
    print("  POST /api/meals      - Log new meal")
    print("  GET  /api/summary    - Get daily summary")
    print("  GET  /api/weekly     - Get weekly data")
    print("  GET  /api/foods      - Search food database")
    print("=" * 40 + "\n")
    
    app.run(host="0.0.0.0", port=5001, debug=True)


# ============== Posts/Social Feed Routes ==============

@app.route("/api/posts", methods=["GET"])
def get_posts():
    """Get all posts for the explore/social feed"""
    try:
        posts = list(posts_collection.find().sort("created_at", -1).limit(50))
        return jsonify({"posts": [serialize_post(post) for post in posts]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/posts", methods=["POST"])
def create_post():
    """Create a new post"""
    try:
        data = request.json
        now = datetime.utcnow()
        post = {
            "userId": data.get("userId"),
            "userName": data.get("userName", "Anonymous"),
            "mealName": data.get("mealName", ""),
            "caption": data.get("caption", ""),
            "calories": data.get("calories"),
            "imageData": data.get("imageData", ""),
            "likes": 0,
            "likedBy": [],
            "createdAt": now
        }
        result = posts_collection.insert_one(post)
        post["_id"] = result.inserted_id
        return jsonify({"success": True, "post": serialize_post(post)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/posts/<post_id>/like", methods=["POST"])
def like_post(post_id):
    """Like or unlike a post"""
    try:
        data = request.json
        user_id = data.get("userId", "anonymous")
        post = posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404
        liked_by = post.get("likedBy", [])
        if user_id in liked_by:
            liked_by.remove(user_id)
            is_liked = False
        else:
            liked_by.append(user_id)
            is_liked = True
        new_likes = len(liked_by)
        posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"likes": new_likes, "likedBy": liked_by}}
        )
        return jsonify({"success": True, "likes": new_likes, "isLiked": is_liked})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def serialize_post(post):
    """Convert post document to JSON-serializable format"""
    if post is None:
        return None
    post["id"] = str(post.pop("_id"))
    if "createdAt" in post and isinstance(post["createdAt"], datetime):
        post["createdAt"] = post["createdAt"].isoformat()
    return post
