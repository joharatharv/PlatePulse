import { createContext, useContext, useState } from 'react';
import { todaysMeals, dailySummary, nutritionGoals } from '../api/dummyData';

const MealContext = createContext();

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
};

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState(todaysMeals);
  const [summary, setSummary] = useState(dailySummary);
  const [goals] = useState(nutritionGoals);
  const [toast, setToast] = useState(null);

  const addMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
    
    setMeals(prev => [...prev, newMeal]);
    
    // Update summary
    setSummary(prev => ({
      ...prev,
      consumed: {
        calories: prev.consumed.calories + meal.calories,
        protein: prev.consumed.protein + (meal.nutrition?.protein || 0),
        carbs: prev.consumed.carbs + (meal.nutrition?.carbs || 0),
        fat: prev.consumed.fat + (meal.nutrition?.fat || 0)
      },
      remaining: {
        calories: prev.remaining.calories - meal.calories,
        protein: prev.remaining.protein - (meal.nutrition?.protein || 0),
        carbs: prev.remaining.carbs - (meal.nutrition?.carbs || 0),
        fat: prev.remaining.fat - (meal.nutrition?.fat || 0)
      },
      mealsLogged: prev.mealsLogged + 1
    }));

    showToast('Meal logged successfully! 🎉');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const value = {
    meals,
    summary,
    goals,
    addMeal,
    toast,
    showToast
  };

  return (
    <MealContext.Provider value={value}>
      {children}
    </MealContext.Provider>
  );
};
