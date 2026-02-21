// Dummy API stub data for PlatePulse - Indian Meals

// Simulated meal analysis results for Indian food
export const mealAnalysisResults = {
  chicken_biryani: {
    id: "meal_001",
    name: "Chicken Biryani",
    confidence: 0.94,
    totalCalories: 490,
    nutrition: {
      protein: 28,
      carbs: 52,
      fat: 18,
      fiber: 3,
      sugar: 4
    },
    items: [
      { name: "Basmati Rice", calories: 210, portion: "150g" },
      { name: "Chicken (with bone)", calories: 180, portion: "120g" },
      { name: "Ghee", calories: 45, portion: "1 tbsp" },
      { name: "Onions & Spices", calories: 35, portion: "50g" },
      { name: "Raita", calories: 20, portion: "30ml" }
    ]
  },
  masala_dosa: {
    id: "meal_002",
    name: "Masala Dosa with Sambar",
    confidence: 0.92,
    totalCalories: 380,
    nutrition: {
      protein: 12,
      carbs: 58,
      fat: 14,
      fiber: 6,
      sugar: 5
    },
    items: [
      { name: "Dosa (Rice & Urad Dal)", calories: 165, portion: "1 large" },
      { name: "Potato Masala", calories: 120, portion: "100g" },
      { name: "Sambar", calories: 65, portion: "100ml" },
      { name: "Coconut Chutney", calories: 30, portion: "30g" }
    ]
  },
  dal_chawal: {
    id: "meal_003",
    name: "Dal Chawal with Sabzi",
    confidence: 0.96,
    totalCalories: 420,
    nutrition: {
      protein: 18,
      carbs: 62,
      fat: 12,
      fiber: 8,
      sugar: 6
    },
    items: [
      { name: "Steamed Rice", calories: 180, portion: "150g" },
      { name: "Dal Tadka", calories: 140, portion: "150ml" },
      { name: "Mixed Vegetable Sabzi", calories: 70, portion: "100g" },
      { name: "Ghee", calories: 30, portion: "1 tsp" }
    ]
  },
  paneer_butter_masala: {
    id: "meal_004",
    name: "Paneer Butter Masala with Naan",
    confidence: 0.91,
    totalCalories: 650,
    nutrition: {
      protein: 24,
      carbs: 55,
      fat: 38,
      fiber: 4,
      sugar: 8
    },
    items: [
      { name: "Paneer", calories: 260, portion: "150g" },
      { name: "Butter Gravy", calories: 140, portion: "100ml" },
      { name: "Butter Naan", calories: 250, portion: "2 pieces" }
    ]
  },
  poha: {
    id: "meal_005",
    name: "Poha with Chai",
    confidence: 0.95,
    totalCalories: 320,
    nutrition: {
      protein: 8,
      carbs: 48,
      fat: 10,
      fiber: 4,
      sugar: 12
    },
    items: [
      { name: "Poha (Flattened Rice)", calories: 180, portion: "150g" },
      { name: "Peanuts", calories: 60, portion: "20g" },
      { name: "Chai with Milk & Sugar", calories: 80, portion: "150ml" }
    ]
  },
  idli_sambar: {
    id: "meal_006",
    name: "Idli Sambar",
    confidence: 0.97,
    totalCalories: 280,
    nutrition: {
      protein: 10,
      carbs: 48,
      fat: 6,
      fiber: 5,
      sugar: 4
    },
    items: [
      { name: "Idli", calories: 120, portion: "3 pieces" },
      { name: "Sambar", calories: 80, portion: "120ml" },
      { name: "Coconut Chutney", calories: 50, portion: "40g" },
      { name: "Gunpowder (Podi)", calories: 30, portion: "1 tbsp" }
    ]
  }
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
export const API_BASE_URL = 'http://localhost:5000/api';

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
