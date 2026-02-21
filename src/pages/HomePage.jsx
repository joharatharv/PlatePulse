import { Link } from 'react-router-dom';
import { Camera, BarChart3, Flame, Target } from 'lucide-react';
import { useMeals } from '../context/MealContext';

const HomePage = () => {
  const { summary, goals } = useMeals();
  
  const caloriePercentage = Math.round((summary.consumed.calories / goals.calories) * 100);

  return (
    <div className="page">
      {/* Quick Stats Card */}
      <div className="summary-card">
        <div className="summary-title">Today's Calories</div>
        <div className="summary-value">{summary.consumed.calories}</div>
        <div className="summary-subtitle">of {goals.calories} kcal goal ({caloriePercentage}%)</div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="card-title">Quick Actions</h3>
        <Link to="/snap" className="btn btn-primary" style={{ marginBottom: '12px' }}>
          <Camera size={20} />
          Snap & Analyze Meal
        </Link>
        <Link to="/summary" className="btn btn-secondary">
          <BarChart3 size={20} />
          View Daily Summary
        </Link>
      </div>

      {/* Today's Progress */}
      <div className="card">
        <h3 className="card-title">Today's Progress</h3>
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <Flame size={24} color="#10b981" />
            <div className="nutrition-value">{summary.consumed.calories}</div>
            <div className="nutrition-label">Calories</div>
          </div>
          <div className="nutrition-item">
            <Target size={24} color="#ef4444" />
            <div className="nutrition-value">{summary.consumed.protein}g</div>
            <div className="nutrition-label">Protein</div>
          </div>
          <div className="nutrition-item">
            <div className="nutrition-value">{summary.consumed.carbs}g</div>
            <div className="nutrition-label">Carbs</div>
          </div>
          <div className="nutrition-item">
            <div className="nutrition-value">{summary.consumed.fat}g</div>
            <div className="nutrition-label">Fat</div>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>🔥</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
          {summary.streak} Day Streak!
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Keep logging to maintain your streak
        </p>
      </div>
    </div>
  );
};

export default HomePage;
