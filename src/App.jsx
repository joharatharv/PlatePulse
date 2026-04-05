import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { MealProvider } from './context/MealContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import SnapMealPage from './pages/SnapMealPage';
import SummaryPage from './pages/SummaryPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import OnboardingPage from './pages/OnboardingPage';

function AppContent() {
  const { isOnboardingComplete, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading">
          <div className="spinner" />
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading PlatePulse...</p>
        </div>
      </div>
    );
  }

  if (!isOnboardingComplete) {
    return <OnboardingPage />;
  }

  return (
    <MealProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/snap" element={<SnapMealPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Navigation />
        <Toast />
      </div>
    </MealProvider>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;
