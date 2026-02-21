"""
PlatePulse - Flask Backend Server
Connects to MongoDB and provides REST API for the frontend.

Run: python backend/server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# MongoDB Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "platepulse"

# Initialize MongoDB client
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
meals_collection = db["meals"]
summaries_collection = db["daily_summaries"]
food_db_collection = db["food_database"]


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
        print("Meal logged successfully:", meal)
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
                "protein": consumed["totalProtein"],
                "carbs": consumed["totalCarbs"],
                "fat": consumed["totalFat"]
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
    print("\nStarting server on http://localhost:5000")
    print("API Documentation:")
    print("  GET  /api/health     - Health check")
    print("  GET  /api/users/demo - Get demo user")
    print("  GET  /api/meals      - Get meals for date")
    print("  POST /api/meals      - Log new meal")
    print("  GET  /api/summary    - Get daily summary")
    print("  GET  /api/weekly     - Get weekly data")
    print("  GET  /api/foods      - Search food database")
    print("=" * 40 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)
