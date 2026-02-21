"""
PlatePulse - MongoDB Database Initialization Script
Run this script on each team member's laptop to set up the database.

Usage:
    python backend/init_db.py

Requirements:
    - MongoDB running locally (default: mongodb://localhost:27017)
    - Or set MONGO_URI environment variable for remote MongoDB

Install dependencies:
    pip install -r backend/requirements.txt
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import os
import sys

# MongoDB Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "platepulse"

# ============== Indian Food Database ==============
INDIAN_FOODS = [
    # Breakfast Items
    {
        "name": "Poha",
        "category": "Breakfast",
        "calories": 180,
        "serving_size": "150g",
        "nutrition": {"protein": 4, "carbs": 32, "fat": 5, "fiber": 2, "sugar": 2},
        "tags": ["vegetarian", "vegan", "maharashtrian", "quick"],
        "description": "Flattened rice cooked with onions, peanuts, and spices"
    },
    {
        "name": "Idli",
        "category": "Breakfast",
        "calories": 40,
        "serving_size": "1 piece (40g)",
        "nutrition": {"protein": 2, "carbs": 8, "fat": 0.2, "fiber": 0.5, "sugar": 0.3},
        "tags": ["vegetarian", "vegan", "south-indian", "steamed", "healthy"],
        "description": "Steamed rice and urad dal cakes"
    },
    {
        "name": "Masala Dosa",
        "category": "Breakfast",
        "calories": 285,
        "serving_size": "1 large",
        "nutrition": {"protein": 7, "carbs": 42, "fat": 10, "fiber": 3, "sugar": 2},
        "tags": ["vegetarian", "south-indian", "crispy"],
        "description": "Crispy rice crepe filled with spiced potato filling"
    },
    {
        "name": "Upma",
        "category": "Breakfast",
        "calories": 200,
        "serving_size": "150g",
        "nutrition": {"protein": 5, "carbs": 30, "fat": 7, "fiber": 3, "sugar": 1},
        "tags": ["vegetarian", "south-indian", "semolina"],
        "description": "Savory semolina porridge with vegetables"
    },
    {
        "name": "Paratha (Plain)",
        "category": "Breakfast",
        "calories": 150,
        "serving_size": "1 medium",
        "nutrition": {"protein": 4, "carbs": 25, "fat": 5, "fiber": 1, "sugar": 0.5},
        "tags": ["vegetarian", "north-indian", "flatbread"],
        "description": "Layered whole wheat flatbread"
    },
    {
        "name": "Aloo Paratha",
        "category": "Breakfast",
        "calories": 220,
        "serving_size": "1 medium",
        "nutrition": {"protein": 5, "carbs": 32, "fat": 8, "fiber": 2, "sugar": 1},
        "tags": ["vegetarian", "north-indian", "punjabi", "stuffed"],
        "description": "Whole wheat flatbread stuffed with spiced potatoes"
    },
    {
        "name": "Puri Bhaji",
        "category": "Breakfast",
        "calories": 350,
        "serving_size": "3 puris + sabzi",
        "nutrition": {"protein": 8, "carbs": 45, "fat": 16, "fiber": 4, "sugar": 3},
        "tags": ["vegetarian", "north-indian", "fried"],
        "description": "Deep-fried puffed bread with potato curry"
    },
    {
        "name": "Chai (Milk Tea)",
        "category": "Beverages",
        "calories": 80,
        "serving_size": "150ml",
        "nutrition": {"protein": 2, "carbs": 12, "fat": 3, "fiber": 0, "sugar": 10},
        "tags": ["vegetarian", "beverage", "hot"],
        "description": "Indian spiced tea with milk and sugar"
    },
    
    # Lunch/Dinner Main Courses
    {
        "name": "Dal Tadka",
        "category": "Main Course",
        "calories": 140,
        "serving_size": "150ml",
        "nutrition": {"protein": 9, "carbs": 18, "fat": 4, "fiber": 5, "sugar": 2},
        "tags": ["vegetarian", "vegan", "protein-rich", "lentils"],
        "description": "Yellow lentils tempered with spices and ghee"
    },
    {
        "name": "Rajma",
        "category": "Main Course",
        "calories": 160,
        "serving_size": "150g",
        "nutrition": {"protein": 8, "carbs": 22, "fat": 5, "fiber": 7, "sugar": 2},
        "tags": ["vegetarian", "vegan", "punjabi", "protein-rich", "kidney-beans"],
        "description": "Red kidney beans in thick tomato-onion gravy"
    },
    {
        "name": "Chole (Chana Masala)",
        "category": "Main Course",
        "calories": 180,
        "serving_size": "150g",
        "nutrition": {"protein": 9, "carbs": 25, "fat": 6, "fiber": 8, "sugar": 4},
        "tags": ["vegetarian", "vegan", "punjabi", "protein-rich", "chickpeas"],
        "description": "Spiced chickpeas in tangy tomato gravy"
    },
    {
        "name": "Paneer Butter Masala",
        "category": "Main Course",
        "calories": 320,
        "serving_size": "200g",
        "nutrition": {"protein": 16, "carbs": 12, "fat": 24, "fiber": 2, "sugar": 6},
        "tags": ["vegetarian", "north-indian", "rich", "creamy"],
        "description": "Cottage cheese cubes in rich tomato-butter gravy"
    },
    {
        "name": "Palak Paneer",
        "category": "Main Course",
        "calories": 260,
        "serving_size": "200g",
        "nutrition": {"protein": 14, "carbs": 10, "fat": 20, "fiber": 4, "sugar": 3},
        "tags": ["vegetarian", "north-indian", "spinach", "healthy"],
        "description": "Cottage cheese in creamy spinach gravy"
    },
    {
        "name": "Chicken Curry",
        "category": "Main Course",
        "calories": 280,
        "serving_size": "200g",
        "nutrition": {"protein": 28, "carbs": 8, "fat": 16, "fiber": 2, "sugar": 3},
        "tags": ["non-vegetarian", "chicken", "protein-rich"],
        "description": "Chicken pieces in spiced onion-tomato gravy"
    },
    {
        "name": "Butter Chicken",
        "category": "Main Course",
        "calories": 350,
        "serving_size": "200g",
        "nutrition": {"protein": 26, "carbs": 12, "fat": 24, "fiber": 1, "sugar": 5},
        "tags": ["non-vegetarian", "chicken", "north-indian", "creamy", "rich"],
        "description": "Tandoori chicken in creamy tomato-butter sauce"
    },
    {
        "name": "Mutton Rogan Josh",
        "category": "Main Course",
        "calories": 320,
        "serving_size": "200g",
        "nutrition": {"protein": 25, "carbs": 6, "fat": 22, "fiber": 1, "sugar": 2},
        "tags": ["non-vegetarian", "mutton", "kashmiri"],
        "description": "Kashmiri-style mutton in aromatic red gravy"
    },
    {
        "name": "Fish Curry",
        "category": "Main Course",
        "calories": 240,
        "serving_size": "200g",
        "nutrition": {"protein": 24, "carbs": 8, "fat": 14, "fiber": 1, "sugar": 2},
        "tags": ["non-vegetarian", "fish", "coastal", "protein-rich"],
        "description": "Fish pieces in tangy coconut or tomato gravy"
    },
    
    # Rice Dishes
    {
        "name": "Steamed Rice",
        "category": "Rice",
        "calories": 130,
        "serving_size": "150g cooked",
        "nutrition": {"protein": 3, "carbs": 28, "fat": 0.3, "fiber": 0.4, "sugar": 0},
        "tags": ["vegetarian", "vegan", "staple", "gluten-free"],
        "description": "Plain white rice"
    },
    {
        "name": "Chicken Biryani",
        "category": "Rice",
        "calories": 490,
        "serving_size": "300g",
        "nutrition": {"protein": 28, "carbs": 52, "fat": 18, "fiber": 3, "sugar": 4},
        "tags": ["non-vegetarian", "chicken", "hyderabadi", "festive"],
        "description": "Layered basmati rice with spiced chicken"
    },
    {
        "name": "Vegetable Biryani",
        "category": "Rice",
        "calories": 380,
        "serving_size": "300g",
        "nutrition": {"protein": 10, "carbs": 58, "fat": 12, "fiber": 5, "sugar": 4},
        "tags": ["vegetarian", "festive", "aromatic"],
        "description": "Layered basmati rice with mixed vegetables"
    },
    {
        "name": "Jeera Rice",
        "category": "Rice",
        "calories": 180,
        "serving_size": "150g",
        "nutrition": {"protein": 4, "carbs": 32, "fat": 5, "fiber": 1, "sugar": 0},
        "tags": ["vegetarian", "cumin", "aromatic"],
        "description": "Basmati rice tempered with cumin seeds"
    },
    {
        "name": "Pulao",
        "category": "Rice",
        "calories": 220,
        "serving_size": "200g",
        "nutrition": {"protein": 5, "carbs": 38, "fat": 6, "fiber": 2, "sugar": 1},
        "tags": ["vegetarian", "aromatic", "one-pot"],
        "description": "Fragrant rice cooked with vegetables and spices"
    },
    
    # Breads
    {
        "name": "Roti/Chapati",
        "category": "Bread",
        "calories": 70,
        "serving_size": "1 medium",
        "nutrition": {"protein": 3, "carbs": 15, "fat": 0.4, "fiber": 2, "sugar": 0.3},
        "tags": ["vegetarian", "vegan", "whole-wheat", "healthy"],
        "description": "Whole wheat flatbread"
    },
    {
        "name": "Naan",
        "category": "Bread",
        "calories": 130,
        "serving_size": "1 piece",
        "nutrition": {"protein": 4, "carbs": 22, "fat": 3, "fiber": 1, "sugar": 1},
        "tags": ["vegetarian", "tandoor", "leavened"],
        "description": "Leavened flatbread baked in tandoor"
    },
    {
        "name": "Butter Naan",
        "category": "Bread",
        "calories": 180,
        "serving_size": "1 piece",
        "nutrition": {"protein": 4, "carbs": 24, "fat": 8, "fiber": 1, "sugar": 2},
        "tags": ["vegetarian", "tandoor", "rich"],
        "description": "Naan brushed with butter"
    },
    {
        "name": "Garlic Naan",
        "category": "Bread",
        "calories": 160,
        "serving_size": "1 piece",
        "nutrition": {"protein": 4, "carbs": 24, "fat": 5, "fiber": 1, "sugar": 1},
        "tags": ["vegetarian", "tandoor", "garlic"],
        "description": "Naan topped with garlic and coriander"
    },
    {
        "name": "Bhatura",
        "category": "Bread",
        "calories": 200,
        "serving_size": "1 piece",
        "nutrition": {"protein": 4, "carbs": 28, "fat": 9, "fiber": 1, "sugar": 1},
        "tags": ["vegetarian", "fried", "punjabi"],
        "description": "Deep-fried leavened bread"
    },
    
    # Snacks
    {
        "name": "Samosa",
        "category": "Snacks",
        "calories": 150,
        "serving_size": "1 piece",
        "nutrition": {"protein": 3, "carbs": 18, "fat": 8, "fiber": 1, "sugar": 1},
        "tags": ["vegetarian", "fried", "street-food"],
        "description": "Deep-fried pastry with spiced potato filling"
    },
    {
        "name": "Pakora/Bhajiya",
        "category": "Snacks",
        "calories": 180,
        "serving_size": "5 pieces",
        "nutrition": {"protein": 4, "carbs": 20, "fat": 10, "fiber": 2, "sugar": 1},
        "tags": ["vegetarian", "fried", "monsoon-snack"],
        "description": "Vegetable fritters in gram flour batter"
    },
    {
        "name": "Vada Pav",
        "category": "Snacks",
        "calories": 290,
        "serving_size": "1 piece",
        "nutrition": {"protein": 6, "carbs": 38, "fat": 13, "fiber": 2, "sugar": 3},
        "tags": ["vegetarian", "maharashtrian", "street-food"],
        "description": "Spiced potato fritter in a bun with chutneys"
    },
    {
        "name": "Pav Bhaji",
        "category": "Snacks",
        "calories": 380,
        "serving_size": "1 plate",
        "nutrition": {"protein": 10, "carbs": 52, "fat": 16, "fiber": 6, "sugar": 8},
        "tags": ["vegetarian", "maharashtrian", "street-food"],
        "description": "Mashed vegetable curry served with buttered bread"
    },
    {
        "name": "Bhel Puri",
        "category": "Snacks",
        "calories": 200,
        "serving_size": "1 plate",
        "nutrition": {"protein": 4, "carbs": 32, "fat": 7, "fiber": 3, "sugar": 6},
        "tags": ["vegetarian", "chaat", "street-food"],
        "description": "Puffed rice mixed with chutneys and vegetables"
    },
    {
        "name": "Pani Puri/Golgappa",
        "category": "Snacks",
        "calories": 180,
        "serving_size": "6 pieces",
        "nutrition": {"protein": 3, "carbs": 30, "fat": 5, "fiber": 2, "sugar": 4},
        "tags": ["vegetarian", "chaat", "street-food"],
        "description": "Crispy shells filled with spiced water and chickpeas"
    },
    
    # Accompaniments
    {
        "name": "Sambar",
        "category": "Accompaniment",
        "calories": 65,
        "serving_size": "100ml",
        "nutrition": {"protein": 3, "carbs": 10, "fat": 1.5, "fiber": 3, "sugar": 2},
        "tags": ["vegetarian", "vegan", "south-indian", "lentils"],
        "description": "Lentil-based vegetable stew"
    },
    {
        "name": "Coconut Chutney",
        "category": "Accompaniment",
        "calories": 50,
        "serving_size": "30g",
        "nutrition": {"protein": 1, "carbs": 3, "fat": 4, "fiber": 1, "sugar": 1},
        "tags": ["vegetarian", "south-indian", "condiment"],
        "description": "Ground coconut with green chillies"
    },
    {
        "name": "Raita",
        "category": "Accompaniment",
        "calories": 45,
        "serving_size": "100g",
        "nutrition": {"protein": 3, "carbs": 5, "fat": 2, "fiber": 0.5, "sugar": 4},
        "tags": ["vegetarian", "yogurt", "cooling"],
        "description": "Seasoned yogurt with vegetables"
    },
    {
        "name": "Pickle (Achar)",
        "category": "Accompaniment",
        "calories": 30,
        "serving_size": "1 tbsp",
        "nutrition": {"protein": 0.5, "carbs": 2, "fat": 2.5, "fiber": 0.5, "sugar": 1},
        "tags": ["vegetarian", "spicy", "preserved"],
        "description": "Oil-based spiced pickle"
    },
    {
        "name": "Papad",
        "category": "Accompaniment",
        "calories": 40,
        "serving_size": "1 piece",
        "nutrition": {"protein": 2, "carbs": 5, "fat": 2, "fiber": 1, "sugar": 0},
        "tags": ["vegetarian", "vegan", "crispy"],
        "description": "Crispy lentil wafer"
    },
    
    # Desserts
    {
        "name": "Gulab Jamun",
        "category": "Desserts",
        "calories": 150,
        "serving_size": "2 pieces",
        "nutrition": {"protein": 3, "carbs": 25, "fat": 5, "fiber": 0, "sugar": 20},
        "tags": ["vegetarian", "sweet", "festive", "fried"],
        "description": "Deep-fried milk dumplings in sugar syrup"
    },
    {
        "name": "Rasmalai",
        "category": "Desserts",
        "calories": 180,
        "serving_size": "2 pieces",
        "nutrition": {"protein": 6, "carbs": 22, "fat": 8, "fiber": 0, "sugar": 18},
        "tags": ["vegetarian", "sweet", "bengali", "milk-based"],
        "description": "Soft cheese patties in sweetened milk"
    },
    {
        "name": "Kheer",
        "category": "Desserts",
        "calories": 200,
        "serving_size": "150ml",
        "nutrition": {"protein": 5, "carbs": 32, "fat": 6, "fiber": 0.5, "sugar": 24},
        "tags": ["vegetarian", "sweet", "rice-pudding"],
        "description": "Rice pudding with milk and nuts"
    },
    {
        "name": "Jalebi",
        "category": "Desserts",
        "calories": 150,
        "serving_size": "3 pieces",
        "nutrition": {"protein": 2, "carbs": 28, "fat": 5, "fiber": 0, "sugar": 22},
        "tags": ["vegetarian", "sweet", "fried", "crispy"],
        "description": "Deep-fried pretzel-shaped sweets in syrup"
    },
    {
        "name": "Ladoo (Besan)",
        "category": "Desserts",
        "calories": 120,
        "serving_size": "1 piece",
        "nutrition": {"protein": 3, "carbs": 15, "fat": 6, "fiber": 1, "sugar": 10},
        "tags": ["vegetarian", "sweet", "festive"],
        "description": "Sweet gram flour balls"
    },
    {
        "name": "Barfi",
        "category": "Desserts",
        "calories": 130,
        "serving_size": "2 pieces",
        "nutrition": {"protein": 4, "carbs": 18, "fat": 5, "fiber": 0, "sugar": 14},
        "tags": ["vegetarian", "sweet", "milk-based"],
        "description": "Dense milk-based fudge"
    },
    
    # Beverages
    {
        "name": "Lassi (Sweet)",
        "category": "Beverages",
        "calories": 180,
        "serving_size": "200ml",
        "nutrition": {"protein": 6, "carbs": 28, "fat": 5, "fiber": 0, "sugar": 24},
        "tags": ["vegetarian", "yogurt", "cooling", "punjabi"],
        "description": "Sweet yogurt-based drink"
    },
    {
        "name": "Mango Lassi",
        "category": "Beverages",
        "calories": 220,
        "serving_size": "200ml",
        "nutrition": {"protein": 5, "carbs": 38, "fat": 5, "fiber": 1, "sugar": 32},
        "tags": ["vegetarian", "yogurt", "mango", "summer"],
        "description": "Yogurt smoothie with mango"
    },
    {
        "name": "Buttermilk (Chaas)",
        "category": "Beverages",
        "calories": 40,
        "serving_size": "200ml",
        "nutrition": {"protein": 3, "carbs": 4, "fat": 1.5, "fiber": 0, "sugar": 4},
        "tags": ["vegetarian", "yogurt", "digestive", "low-calorie"],
        "description": "Salted diluted yogurt with spices"
    },
    {
        "name": "Nimbu Pani (Lemonade)",
        "category": "Beverages",
        "calories": 60,
        "serving_size": "200ml",
        "nutrition": {"protein": 0, "carbs": 15, "fat": 0, "fiber": 0, "sugar": 14},
        "tags": ["vegetarian", "vegan", "refreshing", "summer"],
        "description": "Indian-style lemonade with salt and sugar"
    },
    {
        "name": "Filter Coffee",
        "category": "Beverages",
        "calories": 90,
        "serving_size": "150ml",
        "nutrition": {"protein": 2, "carbs": 10, "fat": 4, "fiber": 0, "sugar": 8},
        "tags": ["vegetarian", "south-indian", "hot", "caffeine"],
        "description": "South Indian filter coffee with milk"
    }
]

# ============== Sample Meals for Demo User ==============
def get_sample_meals(user_id):
    """Generate sample meals for the past 7 days"""
    meals = []
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    sample_meal_data = [
        # Today
        {
            "day_offset": 0,
            "meals": [
                {"mealType": "Breakfast", "name": "Poha with Chai", "time": "08:30", "calories": 320,
                 "nutrition": {"protein": 8, "carbs": 48, "fat": 10, "fiber": 4, "sugar": 12},
                 "items": [
                     {"name": "Poha", "calories": 180, "portion": "150g"},
                     {"name": "Peanuts", "calories": 60, "portion": "20g"},
                     {"name": "Chai", "calories": 80, "portion": "150ml"}
                 ]},
                {"mealType": "Lunch", "name": "Dal Chawal with Sabzi", "time": "13:00", "calories": 420,
                 "nutrition": {"protein": 18, "carbs": 62, "fat": 12, "fiber": 8, "sugar": 6},
                 "items": [
                     {"name": "Steamed Rice", "calories": 180, "portion": "150g"},
                     {"name": "Dal Tadka", "calories": 140, "portion": "150ml"},
                     {"name": "Mixed Sabzi", "calories": 70, "portion": "100g"},
                     {"name": "Ghee", "calories": 30, "portion": "1 tsp"}
                 ]},
                {"mealType": "Snack", "name": "Samosa with Chai", "time": "16:30", "calories": 280,
                 "nutrition": {"protein": 5, "carbs": 35, "fat": 14, "fiber": 2, "sugar": 11},
                 "items": [
                     {"name": "Samosa", "calories": 150, "portion": "1 piece"},
                     {"name": "Green Chutney", "calories": 10, "portion": "1 tbsp"},
                     {"name": "Chai", "calories": 80, "portion": "150ml"},
                     {"name": "Pakora", "calories": 40, "portion": "1 piece"}
                 ]}
            ]
        },
        # Yesterday
        {
            "day_offset": 1,
            "meals": [
                {"mealType": "Breakfast", "name": "Idli Sambar", "time": "08:00", "calories": 280,
                 "nutrition": {"protein": 10, "carbs": 48, "fat": 6, "fiber": 5, "sugar": 4},
                 "items": [
                     {"name": "Idli", "calories": 120, "portion": "3 pieces"},
                     {"name": "Sambar", "calories": 80, "portion": "120ml"},
                     {"name": "Coconut Chutney", "calories": 50, "portion": "40g"},
                     {"name": "Gunpowder", "calories": 30, "portion": "1 tbsp"}
                 ]},
                {"mealType": "Lunch", "name": "Chicken Biryani", "time": "13:30", "calories": 490,
                 "nutrition": {"protein": 28, "carbs": 52, "fat": 18, "fiber": 3, "sugar": 4},
                 "items": [
                     {"name": "Basmati Rice", "calories": 210, "portion": "150g"},
                     {"name": "Chicken", "calories": 180, "portion": "120g"},
                     {"name": "Ghee & Spices", "calories": 80, "portion": "mix"},
                     {"name": "Raita", "calories": 20, "portion": "30ml"}
                 ]},
                {"mealType": "Dinner", "name": "Paneer Butter Masala with Naan", "time": "20:00", "calories": 650,
                 "nutrition": {"protein": 24, "carbs": 55, "fat": 38, "fiber": 4, "sugar": 8},
                 "items": [
                     {"name": "Paneer", "calories": 260, "portion": "150g"},
                     {"name": "Butter Gravy", "calories": 140, "portion": "100ml"},
                     {"name": "Butter Naan", "calories": 250, "portion": "2 pieces"}
                 ]}
            ]
        },
        # 2 days ago
        {
            "day_offset": 2,
            "meals": [
                {"mealType": "Breakfast", "name": "Aloo Paratha with Curd", "time": "09:00", "calories": 350,
                 "nutrition": {"protein": 10, "carbs": 45, "fat": 15, "fiber": 3, "sugar": 5},
                 "items": [
                     {"name": "Aloo Paratha", "calories": 220, "portion": "1 piece"},
                     {"name": "Curd", "calories": 60, "portion": "100g"},
                     {"name": "Pickle", "calories": 30, "portion": "1 tbsp"},
                     {"name": "Butter", "calories": 40, "portion": "1 tsp"}
                 ]},
                {"mealType": "Lunch", "name": "Chole Bhature", "time": "13:00", "calories": 580,
                 "nutrition": {"protein": 17, "carbs": 68, "fat": 28, "fiber": 10, "sugar": 6},
                 "items": [
                     {"name": "Chole", "calories": 180, "portion": "150g"},
                     {"name": "Bhatura", "calories": 400, "portion": "2 pieces"}
                 ]},
                {"mealType": "Snack", "name": "Vada Pav", "time": "17:00", "calories": 290,
                 "nutrition": {"protein": 6, "carbs": 38, "fat": 13, "fiber": 2, "sugar": 3},
                 "items": [
                     {"name": "Batata Vada", "calories": 150, "portion": "1 piece"},
                     {"name": "Pav", "calories": 100, "portion": "1 bun"},
                     {"name": "Chutneys", "calories": 40, "portion": "mix"}
                 ]},
                {"mealType": "Dinner", "name": "Rajma Chawal", "time": "20:30", "calories": 400,
                 "nutrition": {"protein": 14, "carbs": 58, "fat": 12, "fiber": 10, "sugar": 4},
                 "items": [
                     {"name": "Rajma", "calories": 160, "portion": "150g"},
                     {"name": "Rice", "calories": 180, "portion": "150g"},
                     {"name": "Onion Salad", "calories": 20, "portion": "50g"},
                     {"name": "Pickle", "calories": 40, "portion": "1 tbsp"}
                 ]}
            ]
        },
        # 3 days ago
        {
            "day_offset": 3,
            "meals": [
                {"mealType": "Breakfast", "name": "Masala Dosa", "time": "08:30", "calories": 380,
                 "nutrition": {"protein": 12, "carbs": 58, "fat": 14, "fiber": 6, "sugar": 5},
                 "items": [
                     {"name": "Dosa", "calories": 165, "portion": "1 large"},
                     {"name": "Potato Masala", "calories": 120, "portion": "100g"},
                     {"name": "Sambar", "calories": 65, "portion": "100ml"},
                     {"name": "Coconut Chutney", "calories": 30, "portion": "30g"}
                 ]},
                {"mealType": "Lunch", "name": "Fish Curry with Rice", "time": "13:00", "calories": 420,
                 "nutrition": {"protein": 30, "carbs": 42, "fat": 16, "fiber": 2, "sugar": 3},
                 "items": [
                     {"name": "Fish Curry", "calories": 240, "portion": "200g"},
                     {"name": "Rice", "calories": 180, "portion": "150g"}
                 ]},
                {"mealType": "Dinner", "name": "Butter Chicken with Naan", "time": "20:00", "calories": 580,
                 "nutrition": {"protein": 30, "carbs": 34, "fat": 32, "fiber": 2, "sugar": 6},
                 "items": [
                     {"name": "Butter Chicken", "calories": 350, "portion": "200g"},
                     {"name": "Naan", "calories": 230, "portion": "2 pieces"}
                 ]}
            ]
        },
        # 4 days ago
        {
            "day_offset": 4,
            "meals": [
                {"mealType": "Breakfast", "name": "Upma with Chai", "time": "08:00", "calories": 280,
                 "nutrition": {"protein": 7, "carbs": 42, "fat": 10, "fiber": 4, "sugar": 11},
                 "items": [
                     {"name": "Upma", "calories": 200, "portion": "150g"},
                     {"name": "Chai", "calories": 80, "portion": "150ml"}
                 ]},
                {"mealType": "Lunch", "name": "Vegetable Biryani", "time": "13:00", "calories": 380,
                 "nutrition": {"protein": 10, "carbs": 58, "fat": 12, "fiber": 5, "sugar": 4},
                 "items": [
                     {"name": "Veg Biryani", "calories": 380, "portion": "300g"}
                 ]},
                {"mealType": "Snack", "name": "Pav Bhaji", "time": "17:30", "calories": 380,
                 "nutrition": {"protein": 10, "carbs": 52, "fat": 16, "fiber": 6, "sugar": 8},
                 "items": [
                     {"name": "Bhaji", "calories": 180, "portion": "200g"},
                     {"name": "Pav with Butter", "calories": 200, "portion": "2 pieces"}
                 ]},
                {"mealType": "Dinner", "name": "Dal Fry with Roti", "time": "20:00", "calories": 320,
                 "nutrition": {"protein": 15, "carbs": 45, "fat": 8, "fiber": 8, "sugar": 3},
                 "items": [
                     {"name": "Dal Fry", "calories": 140, "portion": "150ml"},
                     {"name": "Roti", "calories": 140, "portion": "2 pieces"},
                     {"name": "Salad", "calories": 40, "portion": "50g"}
                 ]}
            ]
        },
        # 5 days ago
        {
            "day_offset": 5,
            "meals": [
                {"mealType": "Breakfast", "name": "Puri Bhaji", "time": "09:00", "calories": 420,
                 "nutrition": {"protein": 10, "carbs": 55, "fat": 20, "fiber": 5, "sugar": 4},
                 "items": [
                     {"name": "Puri", "calories": 250, "portion": "4 pieces"},
                     {"name": "Aloo Bhaji", "calories": 170, "portion": "150g"}
                 ]},
                {"mealType": "Lunch", "name": "Mutton Rogan Josh with Rice", "time": "13:30", "calories": 520,
                 "nutrition": {"protein": 32, "carbs": 38, "fat": 26, "fiber": 2, "sugar": 3},
                 "items": [
                     {"name": "Mutton Rogan Josh", "calories": 320, "portion": "200g"},
                     {"name": "Jeera Rice", "calories": 200, "portion": "150g"}
                 ]},
                {"mealType": "Dinner", "name": "Palak Paneer with Roti", "time": "20:00", "calories": 450,
                 "nutrition": {"protein": 20, "carbs": 40, "fat": 24, "fiber": 6, "sugar": 4},
                 "items": [
                     {"name": "Palak Paneer", "calories": 260, "portion": "200g"},
                     {"name": "Roti", "calories": 140, "portion": "2 pieces"},
                     {"name": "Salad", "calories": 50, "portion": "50g"}
                 ]}
            ]
        },
        # 6 days ago
        {
            "day_offset": 6,
            "meals": [
                {"mealType": "Breakfast", "name": "Paratha with Chai", "time": "08:30", "calories": 310,
                 "nutrition": {"protein": 8, "carbs": 42, "fat": 13, "fiber": 3, "sugar": 11},
                 "items": [
                     {"name": "Plain Paratha", "calories": 150, "portion": "1 piece"},
                     {"name": "Curd", "calories": 60, "portion": "100g"},
                     {"name": "Pickle", "calories": 20, "portion": "1 tsp"},
                     {"name": "Chai", "calories": 80, "portion": "150ml"}
                 ]},
                {"mealType": "Lunch", "name": "South Indian Thali", "time": "13:00", "calories": 550,
                 "nutrition": {"protein": 18, "carbs": 82, "fat": 18, "fiber": 10, "sugar": 8},
                 "items": [
                     {"name": "Rice", "calories": 180, "portion": "150g"},
                     {"name": "Sambar", "calories": 80, "portion": "150ml"},
                     {"name": "Rasam", "calories": 40, "portion": "100ml"},
                     {"name": "Kootu", "calories": 100, "portion": "100g"},
                     {"name": "Poriyal", "calories": 70, "portion": "80g"},
                     {"name": "Curd", "calories": 40, "portion": "80g"},
                     {"name": "Papad", "calories": 40, "portion": "1 piece"}
                 ]},
                {"mealType": "Snack", "name": "Bhel Puri", "time": "17:00", "calories": 200,
                 "nutrition": {"protein": 4, "carbs": 32, "fat": 7, "fiber": 3, "sugar": 6},
                 "items": [
                     {"name": "Bhel Puri", "calories": 200, "portion": "1 plate"}
                 ]},
                {"mealType": "Dinner", "name": "Chicken Curry with Chapati", "time": "20:30", "calories": 420,
                 "nutrition": {"protein": 34, "carbs": 32, "fat": 18, "fiber": 4, "sugar": 4},
                 "items": [
                     {"name": "Chicken Curry", "calories": 280, "portion": "200g"},
                     {"name": "Chapati", "calories": 140, "portion": "2 pieces"}
                 ]}
            ]
        }
    ]
    
    for day_data in sample_meal_data:
        date = today - timedelta(days=day_data["day_offset"])
        for meal in day_data["meals"]:
            hour, minute = map(int, meal["time"].split(":"))
            logged_at = date.replace(hour=hour, minute=minute)
            
            meals.append({
                "userId": user_id,
                "name": meal["name"],
                "mealType": meal["mealType"],
                "calories": meal["calories"],
                "nutrition": meal["nutrition"],
                "items": meal["items"],
                "date": date,
                "time": meal["time"],
                "logged_at": logged_at,
                "created_at": logged_at
            })
    
    return meals


def init_database():
    """Initialize the database with sample data"""
    print("\n🍽️  PlatePulse Database Initialization")
    print("=" * 50)
    
    try:
        # Connect to MongoDB
        print(f"\n📡 Connecting to MongoDB: {MONGO_URI}")
        client = MongoClient(MONGO_URI)
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected successfully!")
        
        # Get database
        db = client[DATABASE_NAME]
        
        # ============== Clear existing data ==============
        print("\n🗑️  Clearing existing data...")
        db.users.delete_many({})
        db.meals.delete_many({})
        db.daily_summaries.delete_many({})
        db.food_database.delete_many({})
        print("✅ Existing data cleared")
        
        # ============== Create Demo User ==============
        print("\n👤 Creating demo user...")
        demo_user = {
            "email": "demo@platepulse.app",
            "name": "Demo User",
            "profile": {
                "age": 28,
                "gender": "male",
                "height": 175,  # cm
                "weight": 72,   # kg
                "activityLevel": "moderate"
            },
            "goals": {
                "calories": 2000,
                "protein": 60,
                "carbs": 300,
                "fat": 65,
                "fiber": 30,
                "sugar": 50
            },
            "preferences": {
                "dietType": "non-vegetarian",
                "allergies": [],
                "cuisinePreference": ["North Indian", "South Indian"]
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = db.users.insert_one(demo_user)
        user_id = result.inserted_id
        print(f"✅ Demo user created with ID: {user_id}")
        
        # ============== Insert Indian Food Database ==============
        print("\n🍛 Inserting Indian food database...")
        for food in INDIAN_FOODS:
            food["created_at"] = datetime.utcnow()
        
        db.food_database.insert_many(INDIAN_FOODS)
        print(f"✅ Inserted {len(INDIAN_FOODS)} Indian food items")
        
        # ============== Insert Sample Meals ==============
        print("\n🍽️  Inserting sample meals for past 7 days...")
        sample_meals = get_sample_meals(user_id)
        db.meals.insert_many(sample_meals)
        print(f"✅ Inserted {len(sample_meals)} sample meals")
        
        # ============== Create Daily Summaries ==============
        print("\n📊 Creating daily summaries...")
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        goals = demo_user["goals"]
        
        for i in range(7):
            date = today - timedelta(days=i)
            
            # Aggregate meals for this day
            pipeline = [
                {"$match": {"userId": user_id, "date": date}},
                {"$group": {
                    "_id": None,
                    "totalCalories": {"$sum": "$calories"},
                    "totalProtein": {"$sum": "$nutrition.protein"},
                    "totalCarbs": {"$sum": "$nutrition.carbs"},
                    "totalFat": {"$sum": "$nutrition.fat"},
                    "totalFiber": {"$sum": "$nutrition.fiber"},
                    "totalSugar": {"$sum": "$nutrition.sugar"},
                    "mealsCount": {"$sum": 1}
                }}
            ]
            
            result = list(db.meals.aggregate(pipeline))
            
            if result:
                consumed = result[0]
                summary = {
                    "userId": user_id,
                    "date": date,
                    "consumed": {
                        "calories": consumed["totalCalories"],
                        "protein": consumed["totalProtein"],
                        "carbs": consumed["totalCarbs"],
                        "fat": consumed["totalFat"],
                        "fiber": consumed.get("totalFiber", 0),
                        "sugar": consumed.get("totalSugar", 0)
                    },
                    "remaining": {
                        "calories": max(0, goals["calories"] - consumed["totalCalories"]),
                        "protein": max(0, goals["protein"] - consumed["totalProtein"]),
                        "carbs": max(0, goals["carbs"] - consumed["totalCarbs"]),
                        "fat": max(0, goals["fat"] - consumed["totalFat"])
                    },
                    "mealsLogged": consumed["mealsCount"],
                    "waterIntake": 6 + (i % 3),  # Sample water intake
                    "created_at": datetime.utcnow()
                }
                db.daily_summaries.insert_one(summary)
        
        print(f"✅ Created 7 daily summaries")
        
        # ============== Create Indexes ==============
        print("\n🔍 Creating indexes...")
        db.users.create_index("email", unique=True)
        db.meals.create_index([("userId", 1), ("date", 1)])
        db.meals.create_index("logged_at")
        db.daily_summaries.create_index([("userId", 1), ("date", 1)], unique=True)
        db.food_database.create_index("name")
        db.food_database.create_index("category")
        db.food_database.create_index("tags")
        print("✅ Indexes created")
        
        # ============== Print Summary ==============
        print("\n" + "=" * 50)
        print("🎉 Database initialization complete!")
        print("=" * 50)
        print(f"\n📊 Summary:")
        print(f"   • Database: {DATABASE_NAME}")
        print(f"   • Users: {db.users.count_documents({})}")
        print(f"   • Food Items: {db.food_database.count_documents({})}")
        print(f"   • Meals Logged: {db.meals.count_documents({})}")
        print(f"   • Daily Summaries: {db.daily_summaries.count_documents({})}")
        
        print(f"\n🔐 Demo User Credentials:")
        print(f"   • Email: demo@platepulse.app")
        print(f"   • User ID: {user_id}")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Start the backend server: python backend/server.py")
        print(f"   2. Start the frontend: npm run dev")
        print(f"   3. Open http://localhost:5173 in your browser")
        
        print("\n" + "=" * 50 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Make sure MongoDB is running:")
        print("   • Local: mongod or run MongoDB service")
        print("   • Docker: docker run -d -p 27017:27017 mongo")
        print("   • Cloud: Set MONGO_URI environment variable")
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
