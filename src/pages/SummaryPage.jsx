import { useState, useEffect } from 'react';
import { Flame, TrendingDown, TrendingUp, Heart, AlertTriangle } from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { useUser } from '../context/UserContext';
import { api, weeklyData as fallbackWeekly } from '../api/dummyData';

// Condition-specific guidance
const CONDITION_TIPS = {
  'Diabetes Type 2':  { icon: '🩸', tip: 'Limit refined carbs and sugar. Prefer low-GI foods — brown rice, lentils, sabzi over rice or maida.' },
  'Hypertension':     { icon: '❤️',  tip: 'Stay within your sodium limit. Avoid pickles, papads, processed snacks, and excess salt in cooking.' },
  'PCOS':             { icon: '⚡',  tip: 'Choose complex, low-glycemic carbs. Regular meal timing and high fiber help manage insulin resistance.' },
  'Thyroid Issues':   { icon: '🦋',  tip: 'Consistent meal timing supports thyroid function. Avoid excess soy and large amounts of raw cruciferous vegetables.' },
  'GERD / Acid Reflux':{ icon: '🔥', tip: 'Avoid spicy, fried, and acidic foods. Eat smaller frequent meals; no late-night eating.' },
  'Kidney Disease':   { icon: '🫘',  tip: 'Your protein limit is critical — do not exceed it. Avoid high-potassium and high-phosphorus foods.' },
  'Heart Disease':    { icon: '💗',  tip: 'Choose heart-healthy fats (nuts, olive oil). Limit saturated fat, sodium, and cholesterol.' },
};

export default function SummaryPage() {
  const { summary, goals, meals } = useMeals();
  const { userId, user } = useUser();

  const [weekly, setWeekly] = useState(fallbackWeekly);

  useEffect(() => {
    if (!userId) return;
    api.getWeeklyData(userId).then(data => {
      if (Array.isArray(data) && data.length > 0) setWeekly(data);
    });
  }, [userId]);

  // ── Calorie deficit ──────────────────────────────────────────────
  const consumed  = summary.consumed?.calories || 0;
  const calGoal   = goals.calories || 1800;
  const deficit   = calGoal - consumed;
  const isOnTrack = deficit >= 0;
  const weeklyEstKg = Math.abs((deficit * 7) / 7700).toFixed(2);

  // ── Today's date ─────────────────────────────────────────────────
  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  // ── Sugar / fiber (fallback: compute from meals array) ───────────
  const sugarConsumed = summary.consumed?.sugar
    ?? meals.reduce((s, m) => s + (m.nutrition?.sugar || 0), 0);
  const fiberConsumed = summary.consumed?.fiber
    ?? meals.reduce((s, m) => s + (m.nutrition?.fiber || 0), 0);

  // ── Doctor's goals ───────────────────────────────────────────────
  const doctorGoals  = user?.doctorGoals || {};
  const conditions   = (user?.chronicConditions || []).filter(c => c !== 'None of these');
  const hasDoctorSection = conditions.length > 0
    || Object.values(doctorGoals).some(v => v && v !== '');

  // Build tracked-limit rows for the Doctor's Goals card
  const trackedRows = [
    doctorGoals.caloricLimit  && { label: 'Calories',        consumed: consumed,                       limit: parseFloat(doctorGoals.caloricLimit),  unit: 'kcal', isTarget: false },
    doctorGoals.carbLimit     && { label: 'Carbohydrates',   consumed: summary.consumed?.carbs ?? 0,   limit: parseFloat(doctorGoals.carbLimit),     unit: 'g',    isTarget: false },
    doctorGoals.sugarLimit    && { label: 'Sugar',           consumed: sugarConsumed,                  limit: parseFloat(doctorGoals.sugarLimit),    unit: 'g',    isTarget: false },
    doctorGoals.proteinTarget && { label: 'Protein',         consumed: summary.consumed?.protein ?? 0, limit: parseFloat(doctorGoals.proteinTarget), unit: 'g',    isTarget: true  },
    doctorGoals.fiberTarget   && { label: 'Fiber',           consumed: fiberConsumed,                  limit: parseFloat(doctorGoals.fiberTarget),   unit: 'g',    isTarget: true  },
  ].filter(Boolean);

  // ── Macro progress rows ──────────────────────────────────────────
  const progressItems = [
    { label: 'Calories', consumed: summary.consumed?.calories ?? 0, goal: goals.calories, unit: 'kcal', color: 'calories' },
    { label: 'Protein',  consumed: summary.consumed?.protein  ?? 0, goal: goals.protein,  unit: 'g',    color: 'protein'  },
    { label: 'Carbs',    consumed: summary.consumed?.carbs    ?? 0, goal: goals.carbs,    unit: 'g',    color: 'carbs'    },
    { label: 'Fat',      consumed: summary.consumed?.fat      ?? 0, goal: goals.fat,      unit: 'g',    color: 'fat'      },
  ];

  return (
    <div className="page">

      {/* ── Date ─────────────────────────────────────────────────── */}
      <div className="summary-date-row">
        <span className="summary-date-label">{todayLabel}</span>
      </div>

      {/* ── Calorie hero ─────────────────────────────────────────── */}
      <div className="summary-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="summary-title">Calories Consumed</div>
            <div className="summary-value">{consumed.toLocaleString()}</div>
            <div className="summary-subtitle">
              {isOnTrack
                ? `${deficit.toLocaleString()} kcal remaining`
                : `${Math.abs(deficit).toLocaleString()} kcal over goal`}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Flame size={48} />
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              {Math.round((consumed / calGoal) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Deficit / surplus card ───────────────────────────────── */}
      <div className={`summary-deficit-card${isOnTrack ? '' : ' over'}`}>
        <div className="summary-deficit-icon">
          {isOnTrack
            ? <TrendingDown size={22} color="#10b981" />
            : <TrendingUp   size={22} color="#ef4444" />}
        </div>
        <div className="summary-deficit-body">
          <div className="summary-deficit-title">
            {isOnTrack
              ? `${deficit.toLocaleString()} kcal deficit today`
              : `${Math.abs(deficit).toLocaleString()} kcal surplus today`}
          </div>
          <div className="summary-deficit-sub">
            {isOnTrack
              ? `At this rate, est. ${weeklyEstKg} kg lost this week`
              : `Slightly over goal — lighter meals tomorrow will help`}
          </div>
        </div>
      </div>

      {/* ── Doctor's Goals card ──────────────────────────────────── */}
      {hasDoctorSection && (
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} color="#6366f1" /> Doctor's Goals
          </h3>

          {/* Condition chips */}
          {conditions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {conditions.map(c => (
                <span key={c} className="wl-condition-chip">{c}</span>
              ))}
            </div>
          )}

          {/* Tracked limit progress bars */}
          {trackedRows.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {trackedRows.map(row => {
                const pct = Math.min((row.consumed / row.limit) * 100, 100);
                const isOver = !row.isTarget && row.consumed > row.limit;
                const isUnder = row.isTarget && row.consumed < row.limit * 0.7;
                return (
                  <div key={row.label} className="progress-container">
                    <div className="progress-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {row.label}
                        {isOver  && <span className="dr-limit-badge over">Over limit</span>}
                        {isUnder && <span className="dr-limit-badge under">Below target</span>}
                      </span>
                      <span style={{ color: isOver ? 'var(--error)' : 'var(--text-secondary)' }}>
                        {typeof row.consumed === 'number' ? row.consumed.toFixed(1) : row.consumed}
                        {row.unit} / {row.limit}{row.unit}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: isOver
                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                            : isUnder
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sodium (not tracked — show as text) */}
          {doctorGoals.sodiumLimit && (
            <div className="dr-note-row">
              <span className="dr-note-key">Sodium limit</span>
              <span className="dr-note-val">{doctorGoals.sodiumLimit} mg/day</span>
            </div>
          )}

          {/* Water intake recommendation */}
          {doctorGoals.waterIntake && (
            <div className="dr-note-row">
              <span className="dr-note-key">Water target</span>
              <span className="dr-note-val">{doctorGoals.waterIntake} glasses/day</span>
            </div>
          )}

          {/* Foods to avoid */}
          {doctorGoals.foodsToAvoid && (
            <div className="dr-avoid-box">
              <AlertTriangle size={13} color="#f59e0b" />
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Avoid: </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {doctorGoals.foodsToAvoid}
                </span>
              </div>
            </div>
          )}

          {/* Special warnings */}
          {doctorGoals.specialWarnings && (
            <div className="dr-notes-box">
              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                Doctor's note:{' '}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {doctorGoals.specialWarnings}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Condition-specific tips ──────────────────────────────── */}
      {conditions.length > 0 && (
        <div className="card">
          <h3 className="card-title">Condition Guidance</h3>
          {conditions.map(c => {
            const tip = CONDITION_TIPS[c];
            if (!tip) return null;
            return (
              <div key={c} className="condition-tip-row">
                <div className="condition-tip-icon">{tip.icon}</div>
                <div>
                  <div className="condition-tip-name">{c}</div>
                  <div className="condition-tip-text">{tip.tip}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Macro progress ───────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title">Nutrition Progress</h3>
        {progressItems.map(item => {
          const pct = Math.min((item.consumed / item.goal) * 100, 100);
          return (
            <div key={item.label} className="progress-container">
              <div className="progress-header">
                <span>{item.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.consumed} / {item.goal} {item.unit}
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${item.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Weekly chart ─────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title">This Week</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', marginBottom: '8px' }}>
          {weekly.map(day => {
            const h = (day.calories / day.goal) * 80;
            const over = day.calories > day.goal;
            return (
              <div key={day.day} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  height: `${Math.min(h, 100)}px`,
                  background: over
                    ? 'linear-gradient(180deg, #ef4444 0%, #f87171 100%)'
                    : 'linear-gradient(180deg, #10b981 0%, #34d399 100%)',
                  borderRadius: '4px 4px 0 0', margin: '0 4px', minHeight: '4px',
                }} />
                <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748b' }}>{day.day}</div>
              </div>
            );
          })}
        </div>
        {(() => {
          const active = weekly.filter(d => d.calories > 0);
          if (!active.length) return null;
          const avg = Math.round(active.reduce((s, d) => s + d.calories, 0) / active.length);
          const weeklyDef = (calGoal - avg) * 7;
          const estLoss = (weeklyDef / 7700).toFixed(2);
          return (
            <div className="summary-weekly-avg">
              <span>Avg {avg.toLocaleString()} kcal/day</span>
              {weeklyDef > 0
                ? <span className="summary-weekly-green">Est. −{estLoss} kg this week</span>
                : <span className="summary-weekly-red">Slight surplus this week</span>}
            </div>
          );
        })()}
      </div>

      {/* ── Quick stats ──────────────────────────────────────────── */}
      <div className="card">
        <h3 className="card-title">Today's Stats</h3>
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <div className="nutrition-value">{summary.mealsLogged ?? 0}</div>
            <div className="nutrition-label">Meals Logged</div>
          </div>
          <div className="nutrition-item">
            <div className="nutrition-value">{sugarConsumed.toFixed(1)}g</div>
            <div className="nutrition-label">Sugar</div>
          </div>
          <div className="nutrition-item">
            <div className="nutrition-value">{fiberConsumed.toFixed(1)}g</div>
            <div className="nutrition-label">Fiber</div>
          </div>
          <div className="nutrition-item">
            <div className="nutrition-value">{summary.waterIntake ?? 0}</div>
            <div className="nutrition-label">Glasses Water</div>
          </div>
        </div>
      </div>

    </div>
  );
}
