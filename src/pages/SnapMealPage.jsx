import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Check, X } from 'lucide-react';
import { useMeals } from '../context/MealContext';
import { getRandomMealAnalysis, simulateApiCall } from '../api/dummyData';

const SnapMealPage = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [mealType, setMealType] = useState('Lunch');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { addMeal } = useMeals();
  const navigate = useNavigate();

  const formatNumber = (value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return value;
    return Number.isInteger(numericValue) ? numericValue : numericValue.toFixed(1);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const attachStreamToVideo = async () => {
      if (!isCameraOpen || !videoRef.current || !streamRef.current) return;

      try {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      } catch (error) {
        console.error('Unable to start camera preview:', error);
      }
    };

    attachStreamToVideo();
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleOpenCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('Camera API is not supported in this browser.');
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Unable to open camera:', error);
    }
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedImage = canvas.toDataURL('image/jpeg', 0.9);
    setImage(null);
    setImagePreview(capturedImage);
    setAnalysisResult(null);
    stopCamera();
  };

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
      nutrition: analysisResult.nutrition,
      items: analysisResult.items
    };

    addMeal(meal);
    navigate('/');
  };

  const handleReset = () => {
    stopCamera();
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
  };

  return (
    <div className="page">
      {/* Image Upload Area */}
      {!imagePreview ? (
        <>
          {isCameraOpen ? (
            <div className="card">
              <video ref={videoRef} className="camera-preview" playsInline muted autoPlay />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={stopCamera} style={{ flex: 1 }}>
                  <X size={20} />
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCapturePhoto} style={{ flex: 2 }}>
                  <Camera size={20} />
                  Take Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-area">
              <Camera size={48} />
              <p>Take a meal photo directly or upload from gallery</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={handleOpenCamera} style={{ flex: 2 }}>
                  <Camera size={20} />
                  Open Camera
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ flex: 1 }}
                >
                  <Upload size={20} />
                  Upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
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
                <div className="nutrition-value">{formatNumber(analysisResult.nutrition.protein)}g</div>
                <div className="nutrition-label">Protein</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{formatNumber(analysisResult.nutrition.carbs)}g</div>
                <div className="nutrition-label">Carbs</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{formatNumber(analysisResult.nutrition.fat)}g</div>
                <div className="nutrition-label">Fat</div>
              </div>
            </div>

            <div className="food-items">
              <h4 style={{ marginBottom: '8px' }}>Detected Items</h4>
              {analysisResult.items.map((item, index) => (
                <div key={index} className="food-item">
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatNumber(item.grams)}g • P {formatNumber(item.nutrition.protein)}g • C {formatNumber(item.nutrition.carbs)}g • F {formatNumber(item.nutrition.fat)}g
                    </div>
                  </div>
                  <span>{formatNumber(item.calories)} kcal</span>
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
