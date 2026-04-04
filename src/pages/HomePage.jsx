import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, BarChart3, Heart } from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { useUser } from '../context/UserContext';

const HomePage = () => {
  const { summary, goals } = useMeals();
  const { user, userId, updateUser } = useUser();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  // ── Weight journey calculations ──────────────────────────────────
  const startWeight  = parseFloat(user?.profile?.startWeight || user?.profile?.weight || 0);
  const currentWeight = parseFloat(user?.profile?.weight || 0);
  const targetWeight  = parseFloat(user?.targetWeight || 0);
  const totalJourney  = startWeight - targetWeight;
  const lostSoFar     = startWeight - currentWeight;
  const toGo          = Math.max(0, currentWeight - targetWeight);
  const progressPct   = totalJourney > 0
    ? Math.min(100, Math.max(0, (lostSoFar / totalJourney) * 100))
    : 0;
  // ~0.5 kg lost per week on a 500 kcal/day deficit
  const weeksEst = toGo > 0 ? Math.ceil(toGo / 0.5) : 0;

  // ── Calorie calculations ─────────────────────────────────────────
  const consumed  = summary.consumed?.calories || 0;
  const calGoal   = goals.calories || 1800;
  const remaining = calGoal - consumed;
  const calPct    = Math.min(100, (consumed / calGoal) * 100);
  const isOver    = consumed > calGoal;

  // ── Doctor / conditions ──────────────────────────────────────────
  const conditions = (user?.chronicConditions || []).filter(c => c !== 'None of these');
  const doctorGoals = user?.doctorGoals || {};
  const hasPlan = conditions.length > 0 || doctorGoals.foodsToAvoid || doctorGoals.specialWarnings;

  // ── Weight update ────────────────────────────────────────────────
  const handleWeightSave = async () => {
    const val = parseFloat(newWeight);
    if (!val || val <= 0) return;
    setSavingWeight(true);
    try {
      const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { ...user.profile, weight: val } }),
      });
      if (res.ok) {
        updateUser(await res.json());
        setShowWeightInput(false);
        setNewWeight('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWeight(false);
    }
  };

  return (
    <div className="page">

      {/* ── Weight Journey Card ──────────────────────────────────── */}
      <div className="wl-journey-card">
        <div className="wl-journey-header">
          <div>
            <div className="wl-journey-label">Weight Journey</div>
            <div className="wl-journey-title">
              {toGo > 0 ? `${toGo.toFixed(1)} kg to go` : 'Goal reached! 🎯'}
            </div>
          </div>
          <button
            className="wl-update-btn"
            onClick={() => { setShowWeightInput(v => !v); setNewWeight(String(currentWeight)); }}
          >
            Update
          </button>
        </div>

        {/* Bar */}
        <div className="wl-bar-wrap">
          <div className="wl-bar-track">
            <div className="wl-bar-fill" style={{ width: `${progressPct}%` }} />
            <div className="wl-bar-dot"  style={{ left: `${Math.max(0, Math.min(100, progressPct))}%` }} />
          </div>
          <div className="wl-bar-endpoints">
            <span>{startWeight} kg <span className="wl-bar-hint">Start</span></span>
            <span>{targetWeight} kg <span className="wl-bar-hint">Goal</span></span>
          </div>
        </div>

        {/* Stats */}
        <div className="wl-stats-row">
          <div className="wl-stat">
            <div className="wl-stat-value">{currentWeight} kg</div>
            <div className="wl-stat-label">Current</div>
          </div>
          <div className="wl-stat-divider" />
          <div className="wl-stat">
            <div className="wl-stat-value">
              {lostSoFar > 0 ? `-${lostSoFar.toFixed(1)} kg` : '—'}
            </div>
            <div className="wl-stat-label">Lost</div>
          </div>
          <div className="wl-stat-divider" />
          <div className="wl-stat">
            <div className="wl-stat-value">{weeksEst > 0 ? `~${weeksEst} wk` : '🎯'}</div>
            <div className="wl-stat-label">Est. time</div>
          </div>
        </div>

        {/* Inline weight update */}
        {showWeightInput && (
          <div className="wl-weight-input">
            <input
              type="number"
              className="onb-input wl-weight-field"
              placeholder="Enter today's weight (kg)"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
                onClick={handleWeightSave}
                disabled={savingWeight}
              >
                {savingWeight ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn btn-secondary wl-cancel-btn"
                style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
                onClick={() => setShowWeightInput(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Today's Calories ─────────────────────────────────────── */}
      <div className="wl-calorie-card">
        <div className="wl-calorie-top">
          <span className="wl-calorie-label">Today's Calories</span>
          <span className={`wl-budget-badge${isOver ? ' over' : ''}`}>
            {isOver ? 'Over budget' : 'Deficit goal'}
          </span>
        </div>

        <div className="wl-calorie-big">{consumed.toLocaleString()}</div>
        <div className="wl-calorie-unit">kcal consumed</div>

        <div className="wl-calorie-bar-wrap">
          <div className={`wl-calorie-fill${isOver ? ' over' : ''}`} style={{ width: `${calPct}%` }} />
        </div>

        <div className="wl-calorie-footer">
          {isOver
            ? <span className="wl-text-over">{(consumed - calGoal).toLocaleString()} kcal over the {calGoal.toLocaleString()} kcal goal</span>
            : <span className="wl-text-under">{remaining.toLocaleString()} kcal remaining of {calGoal.toLocaleString()} kcal goal</span>
          }
        </div>

        {!isOver && (
          <div className="wl-calorie-tip">
            Staying in deficit keeps you on track to lose ~0.5 kg/week
          </div>
        )}
      </div>

      {/* ── Doctor's Health Plan ─────────────────────────────────── */}
      {hasPlan && (
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="#6366f1" /> Health Plan
          </h3>

          {conditions.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div className="wl-section-micro">Managing</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {conditions.map(c => (
                  <span key={c} className="wl-condition-chip">{c}</span>
                ))}
              </div>
            </div>
          )}

          {doctorGoals.caloricLimit && (
            <div className="wl-plan-row">
              <span className="wl-plan-key">Daily calorie limit</span>
              <span className="wl-plan-val">{doctorGoals.caloricLimit} kcal</span>
            </div>
          )}
          {doctorGoals.foodsToAvoid && (
            <div className="wl-plan-note">
              <span className="wl-plan-key">Avoid: </span>{doctorGoals.foodsToAvoid}
            </div>
          )}
          {doctorGoals.specialWarnings && (
            <div className="wl-plan-note" style={{ marginTop: '6px' }}>
              <span className="wl-plan-key">Note: </span>{doctorGoals.specialWarnings}
            </div>
          )}
        </div>
      )}

      {/* ── Today's Macros ───────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title">Today's Nutrition</h3>
        {[
          { label: 'Protein', consumed: summary.consumed?.protein ?? 0, goal: goals.protein, unit: 'g', color: 'protein' },
          { label: 'Carbs',   consumed: summary.consumed?.carbs   ?? 0, goal: goals.carbs,   unit: 'g', color: 'carbs'   },
          { label: 'Fat',     consumed: summary.consumed?.fat     ?? 0, goal: goals.fat,     unit: 'g', color: 'fat'     },
        ].map(item => (
          <div key={item.label} className="progress-container">
            <div className="progress-header">
              <span>{item.label}</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {item.consumed}{item.unit} / {item.goal}{item.unit}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${item.color}`}
                style={{ width: `${Math.min((item.consumed / item.goal) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title">Log a Meal</h3>
        <Link to="/snap" className="btn btn-primary" style={{ marginBottom: '10px' }}>
          <Camera size={20} /> Snap & Analyze Meal
        </Link>
        <Link to="/summary" className="btn btn-secondary">
          <BarChart3 size={20} /> View Daily Summary
        </Link>
      </div>

      {/* ── Streak ───────────────────────────────────────────────── */}
      {summary.streak > 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>🔥</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
            {summary.streak} Day Streak!
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Keep logging to maintain your streak</p>
        </div>
      )}

    </div>
  );
};

export default HomePage;
