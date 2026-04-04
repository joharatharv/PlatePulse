import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Check, X, AlertTriangle } from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { useUser } from '../context/UserContext';
import { getRandomMealAnalysis, simulateApiCall } from '../api/dummyData';
import { checkAllergens } from '../utils/allergenChecker';

const SnapMealPage = () => {
  const [, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [allergenMatches, setAllergenMatches] = useState([]);
  const [mealType, setMealType] = useState('Lunch');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { addMeal, summary, meals } = useMeals();
  const { user } = useUser();
  const navigate = useNavigate();

  const userAllergens = user?.preferences?.allergies || [];

  const formatNumber = (value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    return Number.isInteger(n) ? n : n.toFixed(1);
  };

  // ── Camera lifecycle ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const attach = async () => {
      if (!isCameraOpen || !videoRef.current || !streamRef.current) return;
      try {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      } catch (e) {
        console.error('Camera preview error:', e);
      }
    };
    attach();
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleOpenCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (e) {
      console.error('Camera open error:', e);
    }
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage(null);
    setImagePreview(canvas.toDataURL('image/jpeg', 0.9));
    setAnalysisResult(null);
    setAllergenMatches([]);
    stopCamera();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setAnalysisResult(null);
    setAllergenMatches([]);
  };

  // ── Analysis ─────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    const result = await simulateApiCall(getRandomMealAnalysis(), 2000);
    setAnalysisResult(result);
    setAllergenMatches(checkAllergens(result.items, userAllergens));
    setIsAnalyzing(false);
  };

  // ── Log meal ─────────────────────────────────────────────────────
  const handleConfirmLog = () => {
    if (!analysisResult) return;
    addMeal({
      mealType,
      name: analysisResult.name,
      calories: analysisResult.totalCalories,
      image: imagePreview,
      nutrition: analysisResult.nutrition,
      items: analysisResult.items,
    });
    navigate('/');
  };

  const handleReset = () => {
    stopCamera();
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setAllergenMatches([]);
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const hasAllergens = allergenMatches.length > 0;

  // Flat set of item names that triggered an allergen (for row highlighting)
  const flaggedItemNames = new Set(
    allergenMatches.flatMap(m => m.matchedItems.map(n => n.toLowerCase()))
  );

  // Doctor limit warnings — computed only when we have an analysis result
  const doctorGoals = user?.doctorGoals || {};
  const doctorLimitWarnings = analysisResult ? (() => {
    const currentSugar = meals.reduce((s, m) => s + (m.nutrition?.sugar || 0), 0);
    const warnings = [];
    const checks = [
      { key: 'caloricLimit',  label: 'Calories',       current: summary.consumed?.calories || 0, add: analysisResult.totalCalories,          unit: 'kcal' },
      { key: 'carbLimit',     label: 'Carbs',           current: summary.consumed?.carbs    || 0, add: analysisResult.nutrition?.carbs    || 0, unit: 'g'    },
      { key: 'sugarLimit',    label: 'Sugar',           current: currentSugar,                    add: analysisResult.nutrition?.sugar    || 0, unit: 'g'    },
      { key: 'proteinTarget', label: 'Protein target',  current: summary.consumed?.protein  || 0, add: analysisResult.nutrition?.protein  || 0, unit: 'g', isTarget: true },
    ];
    for (const c of checks) {
      if (!doctorGoals[c.key]) continue;
      const limit = parseFloat(doctorGoals[c.key]);
      const after = c.current + c.add;
      if (!c.isTarget && after > limit) {
        warnings.push({ label: c.label, after: Math.round(after * 10) / 10, limit, unit: c.unit, over: Math.round((after - limit) * 10) / 10 });
      }
    }
    return warnings;
  })() : [];

  const hasDoctorWarnings = doctorLimitWarnings.length > 0;

  return (
    <div className="page">

      {/* ── Upload / Camera ──────────────────────────────────────── */}
      {!imagePreview ? (
        <>
          {isCameraOpen ? (
            <div className="card">
              <video ref={videoRef} className="camera-preview" playsInline muted autoPlay />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={stopCamera} style={{ flex: 1 }}>
                  <X size={20} /> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCapturePhoto} style={{ flex: 2 }}>
                  <Camera size={20} /> Take Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-area">
              <Camera size={48} />
              <p>Take a meal photo directly or upload from gallery</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={handleOpenCamera} style={{ flex: 2 }}>
                  <Camera size={20} /> Open Camera
                </button>
                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ flex: 1 }}>
                  <Upload size={20} /> Upload
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                onChange={handleImageSelect} className="hidden" />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </>
      ) : (
        <div className="card">
          <img src={imagePreview} alt="Meal" className="image-preview" />
          {!analysisResult && !isAnalyzing && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                <X size={20} /> Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAnalyze} style={{ flex: 2 }}>
                <Camera size={20} /> Analyze Meal
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Analyzing spinner ────────────────────────────────────── */}
      {isAnalyzing && (
        <div className="card">
          <div className="loading">
            <div className="spinner" />
            <p style={{ marginTop: '16px', color: '#64748b' }}>Analyzing your meal...</p>
          </div>
        </div>
      )}

      {/* ── Analysis results ─────────────────────────────────────── */}
      {analysisResult && (
        <>
          {/* ── DOCTOR LIMIT WARNING ───────────────────────────── */}
          {hasDoctorWarnings && (
            <div className="doctor-limit-banner">
              <div className="doctor-limit-title">
                <AlertTriangle size={18} /> Doctor's Limit Alert
              </div>
              <p className="doctor-limit-intro">
                Logging this meal would exceed your doctor-set limits:
              </p>
              <div className="doctor-limit-list">
                {doctorLimitWarnings.map(w => (
                  <div key={w.label} className="doctor-limit-row">
                    <span className="doctor-limit-nutrient">{w.label}</span>
                    <span className="doctor-limit-detail">
                      {w.after}{w.unit} / {w.limit}{w.unit}
                      <span className="doctor-limit-over"> +{w.over}{w.unit} over</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALLERGEN DANGER BANNER ─────────────────────────── */}
          {hasAllergens && (
            <div className="allergen-banner">
              <div className="allergen-banner-title">
                <div className="allergen-banner-pulse" />
                <AlertTriangle size={20} />
                Danger — Allergen Detected
              </div>
              <p className="allergen-banner-intro">
                This meal contains ingredients you're allergic to:
              </p>
              <div className="allergen-banner-list">
                {allergenMatches.map(({ allergen, matchedItems }) => (
                  <div key={allergen} className="allergen-banner-row">
                    <span className="allergen-banner-name">{allergen}</span>
                    <span className="allergen-banner-items">
                      found in: {matchedItems.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Nutrition summary ──────────────────────────────── */}
          <div className="analysis-result">
            <h3 style={{ marginBottom: '8px' }}>{analysisResult.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Confidence: {Math.round(analysisResult.confidence * 100)}%
            </p>

            <div className="nutrition-grid" style={{ marginTop: '16px' }}>
              {[
                { label: 'Calories', val: analysisResult.totalCalories, unit: '' },
                { label: 'Protein',  val: analysisResult.nutrition.protein, unit: 'g' },
                { label: 'Carbs',    val: analysisResult.nutrition.carbs,   unit: 'g' },
                { label: 'Fat',      val: analysisResult.nutrition.fat,     unit: 'g' },
              ].map(({ label, val, unit }) => (
                <div key={label} className="nutrition-item">
                  <div className="nutrition-value">{formatNumber(val)}{unit}</div>
                  <div className="nutrition-label">{label}</div>
                </div>
              ))}
            </div>

            {/* ── Detected items list ─────────────────────────── */}
            <div className="food-items">
              <h4 style={{ marginBottom: '8px' }}>Detected Items</h4>
              {analysisResult.items.map((item, i) => {
                const isFlagged = flaggedItemNames.has(item.name.toLowerCase());
                // Find which allergen(s) this item triggered
                const triggeredAllergens = allergenMatches
                  .filter(m => m.matchedItems.map(n => n.toLowerCase()).includes(item.name.toLowerCase()))
                  .map(m => m.allergen);

                return (
                  <div
                    key={i}
                    className={`food-item${isFlagged ? ' allergen-match' : ''}`}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        {item.name}
                        {isFlagged && triggeredAllergens.map(a => (
                          <span key={a} className="allergen-item-tag">{a}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {formatNumber(item.grams)}g · P {formatNumber(item.nutrition.protein)}g ·
                        C {formatNumber(item.nutrition.carbs)}g · F {formatNumber(item.nutrition.fat)}g
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>{formatNumber(item.calories)} kcal</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Meal type ──────────────────────────────────────── */}
          <div className="card">
            <h3 className="card-title">Meal Type</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                <button
                  key={type}
                  className={`btn ${mealType === type ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: '1 1 45%', padding: '10px' }}
                  onClick={() => setMealType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* ── Log / cancel buttons ────────────────────────────── */}
          {hasAllergens && (
            <div className="allergen-log-warning">
              <AlertTriangle size={15} />
              You have allergens in this meal. Log at your own risk.
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
              <X size={20} /> Cancel
            </button>
            <button
              className={`btn ${hasAllergens ? 'btn-log-anyway' : 'btn-primary'}`}
              onClick={handleConfirmLog}
              style={{ flex: 2 }}
            >
              {hasAllergens
                ? <><AlertTriangle size={18} /> Log Anyway</>
                : <><Check size={20} /> Log Meal</>
              }
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SnapMealPage;
