import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Check, X, Loader } from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { getRandomMealAnalysis, simulateApiCall } from '../api/dummyData';

const SnapMealPage = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [mealType, setMealType] = useState('Lunch');
  const fileInputRef = useRef(null);
  const { addMeal } = useMeals();
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call with dummy data
    const result = await simulateApiCall(getRandomMealAnalysis(), 2000);
    
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleConfirmLog = () => {
    if (!analysisResult) return;

    const meal = {
      mealType,
      name: analysisResult.name,
      calories: analysisResult.totalCalories,
      image: imagePreview,
      nutrition: analysisResult.nutrition
    };

    addMeal(meal);
    navigate('/');
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
  };

  return (
    <div className="page">
      {/* Image Upload Area */}
      {!imagePreview ? (
        <div 
          className="upload-area" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={48} />
          <p>Tap to take a photo or upload an image</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="card">
          <img src={imagePreview} alt="Meal" className="image-preview" />
          
          {!analysisResult && !isAnalyzing && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                <X size={20} />
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAnalyze} style={{ flex: 2 }}>
                <Camera size={20} />
                Analyze Meal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: '#64748b' }}>
              Analyzing your meal...
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <>
          <div className="analysis-result">
            <h3 style={{ marginBottom: '8px' }}>{analysisResult.name}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Confidence: {Math.round(analysisResult.confidence * 100)}%
            </p>
            
            <div className="nutrition-grid" style={{ marginTop: '16px' }}>
              <div className="nutrition-item">
                <div className="nutrition-value">{analysisResult.totalCalories}</div>
                <div className="nutrition-label">Calories</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{analysisResult.nutrition.protein}g</div>
                <div className="nutrition-label">Protein</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{analysisResult.nutrition.carbs}g</div>
                <div className="nutrition-label">Carbs</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{analysisResult.nutrition.fat}g</div>
                <div className="nutrition-label">Fat</div>
              </div>
            </div>

            <div className="food-items">
              <h4 style={{ marginBottom: '8px' }}>Detected Items</h4>
              {analysisResult.items.map((item, index) => (
                <div key={index} className="food-item">
                  <span>{item.name} ({item.portion})</span>
                  <span>{item.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Type Selection */}
          <div className="card">
            <h3 className="card-title">Meal Type</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
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

          {/* Confirm Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
              <X size={20} />
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirmLog} style={{ flex: 2 }}>
              <Check size={20} />
              Log Meal
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SnapMealPage;
