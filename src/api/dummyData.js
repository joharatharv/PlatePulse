// Dummy API stub data for PlatePulse

// Simulated meal analysis results
export const mealAnalysisResults = {
  grilled_chicken_salad: {
    id: "meal_001",
    name: "Grilled Chicken Salad",
    confidence: 0.94,
    totalCalories: 420,
    nutrition: {
      protein: 35,
      carbs: 18,
      fat: 22,
      fiber: 6,
      sugar: 8
    },
    items: [
      { name: "Grilled Chicken Breast", calories: 165, portion: "150g" },
      { name: "Mixed Greens", calories: 20, portion: "100g" },
      { name: "Cherry Tomatoes", calories: 25, portion: "50g" },
      { name: "Olive Oil Dressing", calories: 120, portion: "2 tbsp" },
      { name: "Feta Cheese", calories: 90, portion: "30g" }
    ]
  },
  pasta_bolognese: {
    id: "meal_002",
    name: "Spaghetti Bolognese",
    confidence: 0.91,
    totalCalories: 680,
    nutrition: {
      protein: 28,
      carbs: 75,
      fat: 28,
      fiber: 4,
      sugar: 12
    },
    items: [
      { name: "Spaghetti Pasta", calories: 320, portion: "200g" },
      { name: "Beef Bolognese Sauce", calories: 280, portion: "150g" },
      { name: "Parmesan Cheese", calories: 80, portion: "20g" }
    ]
  },
  breakfast_oatmeal: {
    id: "meal_003",
    name: "Oatmeal with Fruits",
    confidence: 0.96,
    totalCalories: 350,
    nutrition: {
      protein: 12,
      carbs: 58,
      fat: 8,
      fiber: 8,
      sugar: 18
    },
    items: [
      { name: "Oatmeal", calories: 150, portion: "1 cup" },
      { name: "Banana", calories: 90, portion: "1 medium" },
      { name: "Blueberries", calories: 40, portion: "50g" },
      { name: "Honey", calories: 60, portion: "1 tbsp" },
      { name: "Almonds", calories: 10, portion: "5 pieces" }
    ]
  }
};

// Daily nutrition goals
export const nutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 30,
  sugar: 50
};

// Logged meals for today
export const todaysMeals = [
  {
    id: "log_001",
    mealType: "Breakfast",
    name: "Oatmeal with Fruits",
    time: "08:30 AM",
    calories: 350,
    image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=200",
    nutrition: { protein: 12, carbs: 58, fat: 8 }
  },
  {
    id: "log_002",
    mealType: "Lunch",
    name: "Grilled Chicken Salad",
    time: "12:45 PM",
    calories: 420,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200",
    nutrition: { protein: 35, carbs: 18, fat: 22 }
  },
  {
    id: "log_003",
    mealType: "Snack",
    name: "Greek Yogurt with Berries",
    time: "03:30 PM",
    calories: 180,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200",
    nutrition: { protein: 15, carbs: 20, fat: 4 }
  }
];

// Daily summary data
export const dailySummary = {
  date: "2026-02-21",
  consumed: {
    calories: 950,
    protein: 62,
    carbs: 96,
    fat: 34
  },
  remaining: {
    calories: 1050,
    protein: 88,
    carbs: 154,
    fat: 31
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
  { day: "Sun", calories: 950, goal: 2000 }
];

// Simulate API delay
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
