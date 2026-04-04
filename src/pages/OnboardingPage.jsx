import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Target, Shield, Heart } from 'lucide-react';
import { useUser } from '../context/UserContext';

const CHRONIC_CONDITIONS = [
  'Diabetes Type 2',
  'Hypertension',
  'PCOS',
  'Thyroid Issues',
  'GERD / Acid Reflux',
  'Kidney Disease',
  'Heart Disease',
  'None of these',
];

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Soy',
  'Wheat / Gluten',
  'Shellfish',
  'Fish',
  'Sesame',
];

const DIET_TYPES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'light', label: 'Light', desc: '1–3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: '3–5 days/week' },
  { value: 'active', label: 'Active', desc: '6–7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Twice/day or physical job' },
];

const TOTAL_STEPS = 4;

const emptyDoctorGoals = {
  caloricLimit: '',
  sodiumLimit: '',
  sugarLimit: '',
  carbLimit: '',
  proteinTarget: '',
  fiberTarget: '',
  waterIntake: '',
  foodsToAvoid: '',
  specialWarnings: '',
};

export default function OnboardingPage() {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [customAllergen, setCustomAllergen] = useState('');

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: '',
    chronicConditions: [],
    doctorGoals: { ...emptyDoctorGoals },
    allergies: [],
    dietType: '',
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const setDoctor = (field, value) =>
    setForm((prev) => ({ ...prev, doctorGoals: { ...prev.doctorGoals, [field]: value } }));

  const toggleChip = (field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      if (field === 'chronicConditions') {
        if (value === 'None of these') return { ...prev, chronicConditions: ['None of these'] };
        const without = arr.filter((v) => v !== 'None of these');
        return {
          ...prev,
          chronicConditions: without.includes(value)
            ? without.filter((v) => v !== value)
            : [...without, value],
        };
      }
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const addCustomAllergen = () => {
    const trimmed = customAllergen.trim();
    if (trimmed && !form.allergies.includes(trimmed)) {
      set('allergies', [...form.allergies, trimmed]);
    }
    setCustomAllergen('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return 'Please enter your name.';
      if (!form.age || form.age < 10 || form.age > 110) return 'Please enter a valid age.';
      if (!form.gender) return 'Please select your gender.';
      if (!form.currentWeight || form.currentWeight <= 0) return 'Please enter your current weight.';
      if (!form.targetWeight || form.targetWeight <= 0) return 'Please enter your target weight.';
      if (!form.activityLevel) return 'Please select your activity level.';
    }
    if (step === 2 && form.chronicConditions.length === 0) {
      return 'Please select at least one option (or "None of these").';
    }
    if (step === 4 && !form.dietType) return 'Please select your diet type.';
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const back = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    const result = await completeOnboarding(form);
    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
    }
    // On success, UserContext sets isOnboardingComplete → App re-renders automatically
  };

  if (step === 0) return <WelcomeScreen onBegin={() => setStep(1)} />;

  return (
    <div className="onboarding">
      {/* Progress bar */}
      <div className="onb-progress-wrap">
        <div className="onb-progress-bar">
          <div
            className="onb-progress-fill"
            style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <span className="onb-progress-label">
          {step <= TOTAL_STEPS ? `Step ${step} of ${TOTAL_STEPS}` : 'All done!'}
        </span>
      </div>

      <div className="onb-body">
        {step === 1 && <StepProfile form={form} set={set} toggleChip={toggleChip} />}
        {step === 2 && <StepConditions form={form} toggleChip={toggleChip} />}
        {step === 3 && <StepDoctorGoals form={form} setDoctor={setDoctor} />}
        {step === 4 && (
          <StepAllergies
            form={form}
            toggleChip={toggleChip}
            set={set}
            customAllergen={customAllergen}
            setCustomAllergen={setCustomAllergen}
            addCustomAllergen={addCustomAllergen}
          />
        )}
        {step === 5 && <StepComplete form={form} />}

        {error && <p className="onb-error">{error}</p>}

        <div className="onb-nav">
          {step > 1 && (
            <button className="btn btn-secondary onb-btn-back" onClick={back}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button className="btn btn-primary onb-btn-next" onClick={next}>
              Next <ChevronRight size={18} />
            </button>
          )}
          {step === TOTAL_STEPS && (
            <button className="btn btn-primary onb-btn-next" onClick={() => { const err = validateStep(); if (err) { setError(err); return; } setError(''); setStep(5); }}>
              Review <ChevronRight size={18} />
            </button>
          )}
          {step === 5 && (
            <button className="btn btn-primary onb-btn-next" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Setting up...' : 'Start My Journey'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Welcome Screen ─────────────────────────────────────────────── */
function WelcomeScreen({ onBegin }) {
  return (
    <div className="onb-welcome">
      <div className="onb-welcome-top">
        <div className="onb-logo">🍽️</div>
        <h1 className="onb-welcome-title">PlatePulse</h1>
        <p className="onb-welcome-tagline">Lose weight your way</p>
        <p className="onb-welcome-sub">
          Personalized plans powered by your health profile
        </p>
      </div>

      <div className="onb-features">
        <div className="onb-feature-card">
          <div className="onb-feature-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Target size={22} color="#10b981" />
          </div>
          <div>
            <div className="onb-feature-title">Weight Loss Plans</div>
            <div className="onb-feature-desc">Calorie goals tailored to your body and targets</div>
          </div>
        </div>
        <div className="onb-feature-card">
          <div className="onb-feature-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <Heart size={22} color="#6366f1" />
          </div>
          <div>
            <div className="onb-feature-title">Chronic Condition Support</div>
            <div className="onb-feature-desc">Doctor-guided nutrition for your health needs</div>
          </div>
        </div>
        <div className="onb-feature-card">
          <div className="onb-feature-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Shield size={22} color="#ef4444" />
          </div>
          <div>
            <div className="onb-feature-title">Allergen Safety Alerts</div>
            <div className="onb-feature-desc">Instant warnings when dangerous foods are detected</div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary onb-begin-btn" onClick={onBegin}>
        Let's Begin <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── Step 1 — Profile ───────────────────────────────────────────── */
function StepProfile({ form, set, toggleChip }) {
  return (
    <div>
      <h2 className="onb-step-title">Tell us about you</h2>
      <p className="onb-step-sub">We'll use this to calculate your personal calorie goal</p>

      <div className="onb-form-group">
        <label className="onb-label">Full Name *</label>
        <input
          className="onb-input"
          placeholder="e.g. Priya Sharma"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div className="onb-row">
        <div className="onb-form-group">
          <label className="onb-label">Age *</label>
          <input
            className="onb-input"
            type="number"
            placeholder="25"
            value={form.age}
            onChange={(e) => set('age', e.target.value)}
          />
        </div>
        <div className="onb-form-group">
          <label className="onb-label">Gender *</label>
          <select
            className="onb-input"
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="onb-row">
        <div className="onb-form-group">
          <label className="onb-label">Height (cm)</label>
          <input
            className="onb-input"
            type="number"
            placeholder="165"
            value={form.height}
            onChange={(e) => set('height', e.target.value)}
          />
        </div>
        <div className="onb-form-group">
          <label className="onb-label">Current Weight (kg) *</label>
          <input
            className="onb-input"
            type="number"
            placeholder="70"
            value={form.currentWeight}
            onChange={(e) => set('currentWeight', e.target.value)}
          />
        </div>
      </div>

      <div className="onb-form-group">
        <label className="onb-label">Target Weight (kg) *</label>
        <input
          className="onb-input"
          type="number"
          placeholder="60"
          value={form.targetWeight}
          onChange={(e) => set('targetWeight', e.target.value)}
        />
        {form.currentWeight && form.targetWeight && (
          <p className="onb-hint">
            Goal: lose {Math.max(0, form.currentWeight - form.targetWeight)} kg
          </p>
        )}
      </div>

      <div className="onb-form-group">
        <label className="onb-label">Activity Level *</label>
        <div className="onb-activity-list">
          {ACTIVITY_LEVELS.map((a) => (
            <button
              key={a.value}
              type="button"
              className={`onb-activity-item${form.activityLevel === a.value ? ' selected' : ''}`}
              onClick={() => set('activityLevel', a.value)}
            >
              <span className="onb-activity-name">{a.label}</span>
              <span className="onb-activity-desc">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 — Health Conditions ────────────────────────────────── */
function StepConditions({ form, toggleChip }) {
  return (
    <div>
      <h2 className="onb-step-title">Any health conditions?</h2>
      <p className="onb-step-sub">
        We'll customize your nutrition goals to support your health. Select all that apply.
      </p>
      <div className="onb-chip-grid">
        {CHRONIC_CONDITIONS.map((c) => (
          <button
            key={c}
            type="button"
            className={`onb-chip${form.chronicConditions.includes(c) ? ' selected' : ''}${c === 'None of these' ? ' onb-chip-none' : ''}`}
            onClick={() => toggleChip('chronicConditions', c)}
          >
            {form.chronicConditions.includes(c) && c !== 'None of these' && (
              <Check size={14} />
            )}
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 3 — Doctor's Goals ───────────────────────────────────── */
function StepDoctorGoals({ form, setDoctor }) {
  const hasConditions =
    form.chronicConditions.length > 0 && !form.chronicConditions.includes('None of these');

  return (
    <div>
      <h2 className="onb-step-title">Doctor's recommendations</h2>
      <p className="onb-step-sub">
        {hasConditions
          ? `Enter the limits your doctor suggested for ${form.chronicConditions.join(', ')}.`
          : 'No conditions? You can skip this or enter any doctor-advised limits below.'}
        {' '}All fields are optional.
      </p>

      <div className="onb-section-label">Daily Nutrition Limits</div>
      <div className="onb-row">
        <div className="onb-form-group">
          <label className="onb-label">Calorie Limit (kcal)</label>
          <input className="onb-input" type="number" placeholder="1800"
            value={form.doctorGoals.caloricLimit}
            onChange={(e) => setDoctor('caloricLimit', e.target.value)} />
        </div>
        <div className="onb-form-group">
          <label className="onb-label">Sodium Limit (mg)</label>
          <input className="onb-input" type="number" placeholder="2000"
            value={form.doctorGoals.sodiumLimit}
            onChange={(e) => setDoctor('sodiumLimit', e.target.value)} />
        </div>
      </div>

      <div className="onb-row">
        <div className="onb-form-group">
          <label className="onb-label">Sugar Limit (g)</label>
          <input className="onb-input" type="number" placeholder="50"
            value={form.doctorGoals.sugarLimit}
            onChange={(e) => setDoctor('sugarLimit', e.target.value)} />
        </div>
        <div className="onb-form-group">
          <label className="onb-label">Carb Limit (g)</label>
          <input className="onb-input" type="number" placeholder="250"
            value={form.doctorGoals.carbLimit}
            onChange={(e) => setDoctor('carbLimit', e.target.value)} />
        </div>
      </div>

      <div className="onb-row">
        <div className="onb-form-group">
          <label className="onb-label">Protein Target (g)</label>
          <input className="onb-input" type="number" placeholder="60"
            value={form.doctorGoals.proteinTarget}
            onChange={(e) => setDoctor('proteinTarget', e.target.value)} />
        </div>
        <div className="onb-form-group">
          <label className="onb-label">Water Intake (glasses)</label>
          <input className="onb-input" type="number" placeholder="8"
            value={form.doctorGoals.waterIntake}
            onChange={(e) => setDoctor('waterIntake', e.target.value)} />
        </div>
      </div>

      <div className="onb-section-label">Notes from Your Doctor</div>
      <div className="onb-form-group">
        <label className="onb-label">Foods to Avoid</label>
        <textarea className="onb-textarea" rows={3}
          placeholder="e.g. Avoid fried foods, red meat, high-sodium snacks..."
          value={form.doctorGoals.foodsToAvoid}
          onChange={(e) => setDoctor('foodsToAvoid', e.target.value)} />
      </div>
      <div className="onb-form-group">
        <label className="onb-label">Special Warnings / Instructions</label>
        <textarea className="onb-textarea" rows={3}
          placeholder="e.g. Eat every 3 hours, avoid skipping breakfast..."
          value={form.doctorGoals.specialWarnings}
          onChange={(e) => setDoctor('specialWarnings', e.target.value)} />
      </div>
    </div>
  );
}

/* ─── Step 4 — Allergies & Diet ─────────────────────────────────── */
function StepAllergies({ form, toggleChip, set, customAllergen, setCustomAllergen, addCustomAllergen }) {
  return (
    <div>
      <h2 className="onb-step-title">Allergies & diet</h2>
      <p className="onb-step-sub">
        We'll show a danger alert whenever a logged meal contains one of your allergens.
      </p>

      <div className="onb-section-label">Common Allergens</div>
      <div className="onb-chip-grid">
        {COMMON_ALLERGENS.map((a) => (
          <button
            key={a}
            type="button"
            className={`onb-chip${form.allergies.includes(a) ? ' selected' : ''}`}
            onClick={() => toggleChip('allergies', a)}
          >
            {form.allergies.includes(a) && <Check size={14} />}
            {a}
          </button>
        ))}
      </div>

      {/* Custom allergen */}
      <div className="onb-form-group" style={{ marginTop: '12px' }}>
        <label className="onb-label">Add a custom allergen</label>
        <div className="onb-custom-row">
          <input
            className="onb-input"
            placeholder="e.g. Mustard, Mango..."
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomAllergen()}
          />
          <button className="onb-add-btn" onClick={addCustomAllergen} type="button">Add</button>
        </div>
        {form.allergies.filter((a) => !COMMON_ALLERGENS.includes(a)).length > 0 && (
          <div className="onb-chip-grid" style={{ marginTop: '8px' }}>
            {form.allergies.filter((a) => !COMMON_ALLERGENS.includes(a)).map((a) => (
              <button
                key={a}
                type="button"
                className="onb-chip selected"
                onClick={() => set('allergies', form.allergies.filter((x) => x !== a))}
              >
                <Check size={14} /> {a}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="onb-section-label" style={{ marginTop: '20px' }}>Diet Type *</div>
      <div className="onb-chip-grid">
        {DIET_TYPES.map((d) => (
          <button
            key={d}
            type="button"
            className={`onb-chip onb-chip-diet${form.dietType === d ? ' selected' : ''}`}
            onClick={() => set('dietType', d)}
          >
            {form.dietType === d && <Check size={14} />}
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 5 — Review & Confirm ─────────────────────────────────── */
function StepComplete({ form }) {
  const toGo = Math.max(0, (parseFloat(form.currentWeight) || 0) - (parseFloat(form.targetWeight) || 0));
  const conditions = form.chronicConditions.filter((c) => c !== 'None of these');

  return (
    <div className="onb-complete">
      <div className="onb-complete-icon">✅</div>
      <h2 className="onb-step-title">You're all set, {form.name.split(' ')[0]}!</h2>
      <p className="onb-step-sub">Here's a summary of your profile. Tap Start to begin.</p>

      <div className="onb-summary-list">
        <SummaryRow label="Weight Goal" value={toGo > 0 ? `Lose ${toGo} kg` : 'Maintain weight'} />
        <SummaryRow label="Current → Target" value={`${form.currentWeight} kg → ${form.targetWeight} kg`} />
        <SummaryRow label="Activity Level" value={ACTIVITY_LEVELS.find((a) => a.value === form.activityLevel)?.label || '—'} />
        <SummaryRow
          label="Health Conditions"
          value={conditions.length > 0 ? conditions.join(', ') : 'None'}
        />
        <SummaryRow
          label="Allergens"
          value={form.allergies.length > 0 ? form.allergies.join(', ') : 'None'}
          highlight={form.allergies.length > 0}
        />
        <SummaryRow label="Diet Type" value={form.dietType || '—'} />
        {form.doctorGoals.caloricLimit && (
          <SummaryRow label="Doctor's Calorie Limit" value={`${form.doctorGoals.caloricLimit} kcal/day`} />
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="onb-summary-row">
      <span className="onb-summary-label">{label}</span>
      <span className={`onb-summary-value${highlight ? ' onb-summary-alert' : ''}`}>{value}</span>
    </div>
  );
}
