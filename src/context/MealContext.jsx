import { createContext, useContext, useState, useEffect } from 'react';
import { todaysMeals, dailySummary, nutritionGoals, api } from '../api/dummyData';
import { useUser } from './UserContext';

const MealContext = createContext();

export const useMeals = () => {
  const context = useContext(MealContext);
  if (!context) throw new Error('useMeals must be used within a MealProvider');
  return context;
};

export const MealProvider = ({ children }) => {
  const { userId, user } = useUser();

  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(dailySummary);
  const [goals, setGoals] = useState(nutritionGoals);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // Use goals from the already-loaded user profile if available
        if (user?.goals) {
          setGoals(user.goals);
        }

        const today = new Date().toISOString().split('T')[0];

        const mealsData = await api.getMeals(userId, today);
        if (Array.isArray(mealsData)) setMeals(mealsData);

        const summaryData = await api.getDailySummary(userId, today);
        if (summaryData?.consumed) {
          setSummary({ ...summaryData, streak: summaryData.streak || 0 });
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setMeals(todaysMeals);
        setSummary(dailySummary);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [userId]);

  const addMeal = async (meal) => {
    const newMeal = {
      ...meal,
      id: `log_${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    setMeals((prev) => [...prev, newMeal]);

    setSummary((prev) => ({
      ...prev,
      consumed: {
        calories: prev.consumed.calories + meal.calories,
        protein: prev.consumed.protein + (meal.nutrition?.protein || 0),
        carbs:   prev.consumed.carbs   + (meal.nutrition?.carbs   || 0),
        fat:     prev.consumed.fat     + (meal.nutrition?.fat     || 0),
        sugar:   (prev.consumed.sugar  || 0) + (meal.nutrition?.sugar  || 0),
        fiber:   (prev.consumed.fiber  || 0) + (meal.nutrition?.fiber  || 0),
      },
      remaining: {
        calories: Math.max(0, prev.remaining.calories - meal.calories),
        protein:  Math.max(0, prev.remaining.protein  - (meal.nutrition?.protein || 0)),
        carbs:    Math.max(0, prev.remaining.carbs    - (meal.nutrition?.carbs   || 0)),
        fat:      Math.max(0, prev.remaining.fat      - (meal.nutrition?.fat     || 0)),
      },
      mealsLogged: prev.mealsLogged + 1,
    }));

    showToast('Meal logged successfully!');

    try {
      const result = await api.logMeal({
        userId,
        name: meal.name,
        mealType: meal.mealType,
        calories: meal.calories,
        nutrition: meal.nutrition,
        items: meal.items || [],
        image: meal.image,
      });

      if (result.success && result.meal) {
        setMeals((prev) =>
          prev.map((m) => (m.id === newMeal.id ? { ...m, id: result.meal.id } : m))
        );
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
        api.getDailySummary(userId, today),
      ]);
      if (Array.isArray(mealsData)) setMeals(mealsData);
      if (summaryData?.consumed) {
        setSummary({ ...summaryData, streak: summaryData.streak || 0 });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const value = { meals, summary, goals, addMeal, toast, showToast, isLoading, refreshData };

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
};
