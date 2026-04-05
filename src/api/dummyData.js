// Dummy API stub data for PlatePulse - Indian Meals

const roundToOneDecimal = (value) => Math.round((value + Number.EPSILON) * 10) / 10;

const buildAnalysis = (id, name, confidence, items) => {
  const totalCalories = roundToOneDecimal(items.reduce((sum, item) => sum + item.calories, 0));
  const totalProtein = roundToOneDecimal(items.reduce((sum, item) => sum + item.nutrition.protein, 0));
  const totalCarbs = roundToOneDecimal(items.reduce((sum, item) => sum + item.nutrition.carbs, 0));
  const totalFat = roundToOneDecimal(items.reduce((sum, item) => sum + item.nutrition.fat, 0));
  const totalFiber = roundToOneDecimal(items.reduce((sum, item) => sum + (item.nutrition.fiber || 0), 0));
  const totalSugar = roundToOneDecimal(items.reduce((sum, item) => sum + (item.nutrition.sugar || 0), 0));

  return {
    id,
    name,
    confidence,
    totalCalories,
    nutrition: {
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sugar: totalSugar
    },
    items
  };
};

// Simulated meal analysis results for Indian food
export const mealAnalysisResults = {
  chicken_biryani: buildAnalysis("meal_001", "Chicken Biryani", 0.94, [
    {
      name: "Basmati Rice",
      grams: 150,
      calories: 195,
      nutrition: { protein: 4, carbs: 43, fat: 0.5, fiber: 0.6, sugar: 0.1 }
    },
    {
      name: "Chicken",
      grams: 120,
      calories: 240,
      nutrition: { protein: 31, carbs: 0, fat: 13, fiber: 0, sugar: 0 }
    },
    {
      name: "Biryani Masala + Onion",
      grams: 50,
      calories: 55,
      nutrition: { protein: 1.4, carbs: 9, fat: 1.6, fiber: 1.4, sugar: 2 }
    },
    {
      name: "Raita",
      grams: 40,
      calories: 32,
      nutrition: { protein: 1.6, carbs: 2.8, fat: 1.4, fiber: 0, sugar: 2 }
    }
  ]),
  masala_dosa: buildAnalysis("meal_002", "Masala Dosa with Sambar", 0.92, [
    {
      name: "Dosa",
      grams: 120,
      calories: 220,
      nutrition: { protein: 5.5, carbs: 33, fat: 7.5, fiber: 1.5, sugar: 1 }
    },
    {
      name: "Potato Masala",
      grams: 100,
      calories: 130,
      nutrition: { protein: 2.5, carbs: 20, fat: 4.5, fiber: 2.4, sugar: 2.1 }
    },
    {
      name: "Sambar",
      grams: 120,
      calories: 72,
      nutrition: { protein: 3, carbs: 10, fat: 1.8, fiber: 2.2, sugar: 2 }
    },
    {
      name: "Coconut Chutney",
      grams: 35,
      calories: 90,
      nutrition: { protein: 1.5, carbs: 4, fat: 8, fiber: 2, sugar: 1.1 }
    }
  ]),
  dal_chawal: buildAnalysis("meal_003", "Dal Chawal with Sabzi", 0.96, [
    {
      name: "Steamed Rice",
      grams: 160,
      calories: 208,
      nutrition: { protein: 4.2, carbs: 46, fat: 0.5, fiber: 0.6, sugar: 0.1 }
    },
    {
      name: "Dal Tadka",
      grams: 160,
      calories: 190,
      nutrition: { protein: 9.5, carbs: 22, fat: 7.2, fiber: 6.2, sugar: 2.2 }
    },
    {
      name: "Mixed Vegetable Sabzi",
      grams: 100,
      calories: 92,
      nutrition: { protein: 2.5, carbs: 10.5, fat: 4.8, fiber: 3.5, sugar: 3.2 }
    }
  ]),
  paneer_butter_masala: buildAnalysis("meal_004", "Paneer Butter Masala with Naan", 0.91, [
    {
      name: "Paneer Cubes",
      grams: 140,
      calories: 370,
      nutrition: { protein: 24, carbs: 6, fat: 28, fiber: 0, sugar: 2 }
    },
    {
      name: "Butter Masala Gravy",
      grams: 130,
      calories: 200,
      nutrition: { protein: 4, carbs: 11, fat: 16, fiber: 1.3, sugar: 4.5 }
    },
    {
      name: "Butter Naan",
      grams: 110,
      calories: 310,
      nutrition: { protein: 8.5, carbs: 49, fat: 9.5, fiber: 2.2, sugar: 1.4 }
    }
  ]),
  poha: buildAnalysis("meal_005", "Poha with Chai", 0.95, [
    {
      name: "Poha",
      grams: 170,
      calories: 230,
      nutrition: { protein: 5.5, carbs: 35, fat: 7.5, fiber: 2.6, sugar: 2.4 }
    },
    {
      name: "Peanuts",
      grams: 20,
      calories: 114,
      nutrition: { protein: 5.1, carbs: 3.6, fat: 9.8, fiber: 1.7, sugar: 0.9 }
    },
    {
      name: "Chai",
      grams: 150,
      calories: 92,
      nutrition: { protein: 2.4, carbs: 12, fat: 3.5, fiber: 0, sugar: 10 }
    }
  ]),
  idli_sambar: buildAnalysis("meal_006", "Idli Sambar", 0.97, [
    {
      name: "Idli",
      grams: 150,
      calories: 210,
      nutrition: { protein: 6, carbs: 42, fat: 1.2, fiber: 2.3, sugar: 0.5 }
    },
    {
      name: "Sambar",
      grams: 130,
      calories: 82,
      nutrition: { protein: 3.4, carbs: 11, fat: 2.1, fiber: 2.3, sugar: 2.1 }
    },
    {
      name: "Coconut Chutney",
      grams: 40,
      calories: 105,
      nutrition: { protein: 1.8, carbs: 4.6, fat: 9.4, fiber: 2.2, sugar: 1.1 }
    }
  ])
};

// Daily nutrition goals
export const nutritionGoals = {
  calories: 2000,
  protein: 60,
  carbs: 300,
  fat: 65,
  fiber: 30,
  sugar: 50
};

// Logged meals for today (will be fetched from MongoDB in production)
export const todaysMeals = [
  {
    id: "log_001",
    mealType: "Breakfast",
    name: "Poha with Chai",
    time: "08:30 AM",
    calories: 320,
    image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=200",
    nutrition: { protein: 8, carbs: 48, fat: 10 }
  },
  {
    id: "log_002",
    mealType: "Lunch",
    name: "Dal Chawal with Sabzi",
    time: "01:00 PM",
    calories: 420,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200",
    nutrition: { protein: 18, carbs: 62, fat: 12 }
  },
  {
    id: "log_003",
    mealType: "Snack",
    name: "Samosa with Chai",
    time: "04:30 PM",
    calories: 280,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200",
    nutrition: { protein: 5, carbs: 35, fat: 14 }
  }
];

// Daily summary data (will be fetched from MongoDB in production)
export const dailySummary = {
  date: "2026-02-21",
  consumed: {
    calories: 1020,
    protein: 31,
    carbs: 145,
    fat: 36
  },
  remaining: {
    calories: 980,
    protein: 29,
    carbs: 155,
    fat: 29
  },
  mealsLogged: 3,
  waterIntake: 6, // glasses
  streak: 7 // days
};

// Weekly data for charts
export const weeklyData = [
  { day: "Mon", calories: 1850, goal: 2000 },
  { day: "Tue", calories: 2100, goal: 2000 },
  { day: "Wed", calories: 1920, goal: 2000 },
  { day: "Thu", calories: 1780, goal: 2000 },
  { day: "Fri", calories: 2050, goal: 2000 },
  { day: "Sat", calories: 2200, goal: 2000 },
  { day: "Sun", calories: 1020, goal: 2000 }
];

// API Base URL - change this to your backend URL
export const API_BASE_URL = 'http://localhost:5001/api';

// Simulate API delay (for local testing without backend)
export const simulateApiCall = (data, delay = 1500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Get random meal analysis (simulates AI analysis)
export const getRandomMealAnalysis = () => {
  const meals = Object.values(mealAnalysisResults);
  return meals[Math.floor(Math.random() * meals.length)];
};

// Hardcoded demo result for Idli + Sambar photo — replace with real model output once fine-tuned
export const getDemoMealAnalysis = () => buildAnalysis("meal_demo", "Idli with Sambar", 0.97, [
  {
    name: "Idli",
    grams: 150,
    calories: 210,
    nutrition: { protein: 6, carbs: 42, fat: 1.2, fiber: 2.3, sugar: 0.5 }
  },
  {
    name: "Sambar",
    grams: 130,
    calories: 82,
    nutrition: { protein: 3.4, carbs: 11, fat: 2.1, fiber: 2.3, sugar: 2.1 }
  }
]);

// API Helper Functions (will connect to MongoDB backend)
export const api = {
  // Fetch all meals for a user on a specific date
  async getMeals(userId, date) {
    try {
      const response = await fetch(`${API_BASE_URL}/meals?userId=${userId}&date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch meals');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to dummy data
      return todaysMeals;
    }
  },

  // Log a new meal
  async logMeal(mealData) {
    try {
      const response = await fetch(`${API_BASE_URL}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      });
      if (!response.ok) throw new Error('Failed to log meal');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get daily summary
  async getDailySummary(userId, date) {
    try {
      const response = await fetch(`${API_BASE_URL}/summary?userId=${userId}&date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to dummy data
      return dailySummary;
    }
  },

  // Get weekly data
  async getWeeklyData(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/weekly?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch weekly data');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      // Fallback to dummy data
      return weeklyData;
    }
  },

  // Update user goals
  async updateGoals(userId, goals) {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...goals })
      });
      if (!response.ok) throw new Error('Failed to update goals');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }
};
