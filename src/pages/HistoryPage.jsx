import { useMeals } from '../context/MealContext';
import { UtensilsCrossed } from 'lucide-react';

const HistoryPage = () => {
  const { meals } = useMeals();

  const groupedMeals = meals.reduce((acc, meal) => {
    const type = meal.mealType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="page">
      {meals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <UtensilsCrossed size={48} color="#64748b" />
          <h3 style={{ marginTop: '16px', color: '#64748b' }}>No meals logged yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Start by snapping a photo of your meal!
          </p>
        </div>
      ) : (
        mealOrder.map((type) => {
          const typeMeals = groupedMeals[type];
          if (!typeMeals || typeMeals.length === 0) return null;
          
          return (
            <div key={type} className="card">
              <h3 className="card-title">{type}</h3>
              {typeMeals.map((meal) => (
                <div key={meal.id} className="meal-item">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.name} className="meal-image" />
                  ) : (
                    <div 
                      className="meal-image" 
                      style={{ 
                        background: '#e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <UtensilsCrossed size={24} color="#94a3b8" />
                    </div>
                  )}
                  <div className="meal-info">
                    <div className="meal-name">{meal.name}</div>
                    <div className="meal-meta">
                      {meal.time} • P: {meal.nutrition?.protein || 0}g • 
                      C: {meal.nutrition?.carbs || 0}g • F: {meal.nutrition?.fat || 0}g
                    </div>
                  </div>
                  <div className="meal-calories">{meal.calories} kcal</div>
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* Total for today */}
      {meals.length > 0 && (
        <div className="card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Total Today</span>
            <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1.25rem' }}>
              {meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
