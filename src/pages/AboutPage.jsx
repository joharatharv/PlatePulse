import { Target, Shield, Heart, Camera, BarChart3, Zap, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: <Target size={24} color="#10b981" />,
    bg: 'rgba(16,185,129,0.1)',
    title: 'Personalised Weight Loss Plans',
    desc: 'Your calorie goal is calculated from your body profile using the Harris-Benedict formula — not a generic number. We apply a 500 kcal/day deficit to keep you losing ~0.5 kg per week at a safe, sustainable pace.',
  },
  {
    icon: <Heart size={24} color="#6366f1" />,
    bg: 'rgba(99,102,241,0.1)',
    title: 'Chronic Condition Support',
    desc: 'Managing diabetes, hypertension, PCOS, thyroid, GERD, or kidney disease? PlatePulse lets you enter your doctor\'s exact recommendations and tracks every nutrient limit on your daily summary — so you never have to guess.',
  },
  {
    icon: <Shield size={24} color="#ef4444" />,
    bg: 'rgba(239,68,68,0.1)',
    title: 'Allergen Safety Alerts',
    desc: 'Add your allergens once during setup. Every time you log a meal, PlatePulse scans the detected ingredients — including Indian food names like ghee, paneer, moongphali, and naan — and shows a red danger alert if anything matches.',
  },
  {
    icon: <Camera size={24} color="#f59e0b" />,
    bg: 'rgba(245,158,11,0.1)',
    title: 'AI Meal Recognition',
    desc: 'Just snap a photo of your plate. Our fine-tuned model identifies Indian dishes, breaks them down item by item, and returns calories and macros for the full meal — no manual entry needed.',
  },
  {
    icon: <BarChart3 size={24} color="#06b6d4" />,
    bg: 'rgba(6,182,212,0.1)',
    title: 'Progress Insights',
    desc: 'Track your weight journey from start weight to goal weight with a live progress bar. See your daily calorie deficit, weekly averages, and an estimated time to your goal — all updated as you log.',
  },
  {
    icon: <Zap size={24} color="#8b5cf6" />,
    bg: 'rgba(139,92,246,0.1)',
    title: 'Doctor-Guided Daily Goals',
    desc: 'Enter your doctor\'s calorie, sodium, sugar, carb, protein, and fibre limits directly into the app. PlatePulse surfaces them as progress bars and warns you before you log a meal that would push you over a limit.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set up your profile',
    desc: 'Tell us your weight, goal, health conditions, doctor\'s recommendations, and any allergens. Takes under 2 minutes.',
  },
  {
    step: '02',
    title: 'Snap your meals',
    desc: 'Open the camera, take a photo of your plate, and let the AI identify what you ate. Review the breakdown and log it.',
  },
  {
    step: '03',
    title: 'Stay on track',
    desc: 'Watch your weight journey bar move, check your daily deficit, and get instant alerts if a meal contains allergens or pushes you over a doctor\'s limit.',
  },
  {
    step: '04',
    title: 'See real results',
    desc: 'Consistent logging builds a picture of your habits. Weekly charts, average calorie data, and estimated loss keep you motivated and accountable.',
  },
];

const WHY_ITEMS = [
  'Built specifically for Indian meals — our model and food database are trained on South Asian cuisine',
  'Chronic condition support is built in from day one, not added as a premium feature',
  'Allergen detection uses ingredient-level analysis, not just meal names',
  'Your doctor\'s exact limits are tracked — not replaced by generic app defaults',
  'Weight loss math is transparent: we show you the deficit number and what it means in kilograms',
];

export default function AboutPage() {
  return (
    <div className="page about-page">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="about-hero">
        <div className="about-hero-logo">🍽️</div>
        <h1 className="about-hero-title">PlatePulse</h1>
        <p className="about-hero-tagline">Lose weight your way</p>
        <p className="about-hero-sub">
          India's first meal tracker designed around chronic health conditions,
          allergen safety, and doctor-guided nutrition goals.
        </p>
      </div>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <div className="about-mission-card">
        <div className="about-mission-label">Our Mission</div>
        <p className="about-mission-text">
          Weight loss isn't one-size-fits-all. A person managing diabetes has
          different nutritional needs than someone with hypertension or PCOS.
          PlatePulse bridges the gap between your doctor's advice and your daily
          plate — making personalised, safe weight loss accessible to everyone.
        </p>
      </div>

      {/* ── Features ─────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="card-title">Features</h2>
        <div className="about-features-list">
          {FEATURES.map((f, i) => (
            <div key={i} className="about-feature-row">
              <div className="about-feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div className="about-feature-body">
                <div className="about-feature-title">{f.title}</div>
                <div className="about-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────── */}
      <div className="card">
        <h2 className="card-title">How It Works</h2>
        <div className="about-steps">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="about-step-row">
              <div className="about-step-number">{s.step}</div>
              <div className="about-step-body">
                <div className="about-step-title">{s.title}</div>
                <div className="about-step-desc">{s.desc}</div>
              </div>
              {i < HOW_IT_WORKS.length - 1 && <div className="about-step-connector" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Why PlatePulse ───────────────────────────────────────── */}
      <div className="card">
        <h2 className="card-title">Why PlatePulse</h2>
        <div className="about-why-list">
          {WHY_ITEMS.map((item, i) => (
            <div key={i} className="about-why-row">
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="about-why-text">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Built for India ──────────────────────────────────────── */}
      <div className="about-india-card">
        <div className="about-india-flag">🇮🇳</div>
        <h3 className="about-india-title">Built for Indian Plates</h3>
        <p className="about-india-text">
          Our food database and AI model are trained on Indian cuisine — biryani,
          dosa, dal chawal, poha, sabzi, and hundreds more. Allergen detection
          understands ghee, paneer, naan, moongphali, and regional dish names.
          This isn't a Western calorie counter retrofitted for India.
        </p>
      </div>

      {/* ── Footer tagline ───────────────────────────────────────── */}
      <div className="about-footer">
        <p className="about-footer-text">
          Made with care for people managing their health through food.
        </p>
        <p className="about-footer-version">PlatePulse v1.0</p>
      </div>

    </div>
  );
}
