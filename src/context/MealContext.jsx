import { createContext, useContext, useState, useEffect } from 'react';
import { todaysMeals, dailySummary, nutritionGoals, api } from '../api/dummyData';

const MealContext = createContext();

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
};

export const MealProvider = ({ children }) => {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(dailySummary);
  const [goals, setGoals] = useState(nutritionGoals);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch initial data from database on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Get demo user first
        const userResponse = await fetch('http://localhost:5000/api/users/demo');
        let currentUserId = null;
        
        if (userResponse.ok) {
          const user = await userResponse.json();
          currentUserId = 2;
          setUserId(2);
          
          // Update goals from user profile
          if (user.goals) {
            setGoals(user.goals);
          }
        } else {
          console.error('Failed to fetch demo user');
          // Fallback to dummy data
          setMeals(todaysMeals);
          setSummary(dailySummary);
          setIsLoading(false);
          return;
        }

        // Only fetch meals and summary if we have a valid userId
        if (currentUserId) {
          const today = new Date().toISOString().split('T')[0];
          
          // Fetch today's meals from database
          const mealsData = await api.getMeals(currentUserId, today);
          if (Array.isArray(mealsData)) {
            setMeals(mealsData);
          }

          // Fetch daily summary from database
          const summaryData = await api.getDailySummary(currentUserId, today);
          if (summaryData && summaryData.consumed) {
            setSummary({
              ...summaryData,
              streak: summaryData.streak || 7 // Default streak
            });
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Fallback to dummy data on error
        setMeals(todaysMeals);
        setSummary(dailySummary);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const addMeal = async (meal) => {
    const newMeal = {
      ...meal,
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
    
    // Optimistically update local state
    setMeals(prev => [...prev, newMeal]);
    
    // Update summary locally
    setSummary(prev => ({
      ...prev,
      consumed: {
        calories: prev.consumed.calories + meal.calories,
        protein: prev.consumed.protein + (meal.nutrition?.protein || 0),
        carbs: prev.consumed.carbs + (meal.nutrition?.carbs || 0),
        fat: prev.consumed.fat + (meal.nutrition?.fat || 0)
      },
      remaining: {
        calories: Math.max(0, prev.remaining.calories - meal.calories),
        protein: Math.max(0, prev.remaining.protein - (meal.nutrition?.protein || 0)),
        carbs: Math.max(0, prev.remaining.carbs - (meal.nutrition?.carbs || 0)),
        fat: Math.max(0, prev.remaining.fat - (meal.nutrition?.fat || 0))
      },
      mealsLogged: prev.mealsLogged + 1
    }));

    showToast('Meal logged successfully! 🎉');

    // Persist to database via API (don't pass userId - let backend use demo user)
    try {
      const result = await api.logMeal({
        name: meal.name,
        mealType: meal.mealType,
        calories: meal.calories,
        nutrition: meal.nutrition,
        items: meal.items || [],
        image: meal.image
      });
      
      if (result.success && result.meal) {
        // Update the meal with the server-generated ID
        setMeals(prev => 
          prev.map(m => m.id === newMeal.id ? { ...m, id: result.meal.id } : m)
        );
        console.log('Meal saved to database:', result.meal);
      } else if (result.error) {
        console.error('Failed to save meal to database:', result.error);
      }
    } catch (error) {
      console.error('Error saving meal to database:', error);
    }
  };

  const refreshData = async () => {
    if (!userId) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [mealsData, summaryData] = await Promise.all([
        api.getMeals(userId, today),
        api.getDailySummary(userId, today)
      ]);
      
      if (Array.isArray(mealsData)) {
        setMeals(mealsData);
      }
      
      if (summaryData && summaryData.consumed) {
        setSummary({
          ...summaryData,
          streak: summaryData.streak || 7
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
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
    showToast,
    isLoading,
    refreshData
  };

  return (
    <MealContext.Provider value={value}>
      {children}
    </MealContext.Provider>
  );
};
