import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { weeklyData } from '../api/dummyData';

const SummaryPage = () => {
  const { summary, goals } = useMeals();

  const progressItems = [
    { 
      label: 'Calories', 
      consumed: summary.consumed.calories, 
      goal: goals.calories, 
      unit: 'kcal',
      color: 'calories' 
    },
    { 
      label: 'Protein', 
      consumed: summary.consumed.protein, 
      goal: goals.protein, 
      unit: 'g',
      color: 'protein' 
    },
    { 
      label: 'Carbs', 
      consumed: summary.consumed.carbs, 
      goal: goals.carbs, 
      unit: 'g',
      color: 'carbs' 
    },
    { 
      label: 'Fat', 
      consumed: summary.consumed.fat, 
      goal: goals.fat, 
      unit: 'g',
      color: 'fat' 
    },
  ];

  return (
    <div className="page">
      {/* Date Selector */}
      <div className="date-selector">
        <button><ChevronLeft size={24} /></button>
        <span>Today, Feb 21</span>
        <button><ChevronRight size={24} /></button>
      </div>

      {/* Main Calorie Card */}
      <div className="summary-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="summary-title">Calories Consumed</div>
            <div className="summary-value">{summary.consumed.calories}</div>
            <div className="summary-subtitle">{summary.remaining.calories} remaining</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Flame size={48} />
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {Math.round((summary.consumed.calories / goals.calories) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Macro Progress */}
      <div className="card">
        <h3 className="card-title">Nutrition Progress</h3>
        {progressItems.map((item) => {
          const percentage = Math.min((item.consumed / item.goal) * 100, 100);
          return (
            <div key={item.label} className="progress-container">
              <div className="progress-header">
                <span>{item.label}</span>
                <span>{item.consumed} / {item.goal} {item.unit}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Overview */}
      <div className="card">
        <h3 className="card-title">This Week</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px' }}>
          {weeklyData.map((day) => {
            const height = (day.calories / day.goal) * 80;
            const isOver = day.calories > day.goal;
            return (
              <div key={day.day} style={{ textAlign: 'center', flex: 1 }}>
                <div 
                  style={{ 
                    height: `${Math.min(height, 100)}px`,
                    background: isOver 
                      ? 'linear-gradient(180deg, #ef4444 0%, #f87171 100%)'
                      : 'linear-gradient(180deg, #10b981 0%, #34d399 100%)',
                    borderRadius: '4px 4px 0 0',
                    margin: '0 4px',
                    minHeight: '20px'
                  }}
                />
                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748b' }}>
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3 className="card-title">Today's Stats</h3>
        <div>
          <div className="nutrition-item">
            <div className="nutrition-value">{summary.mealsLogged}</div>
            <div className="nutrition-label">Meals Logged</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
