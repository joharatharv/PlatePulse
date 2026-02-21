import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MealProvider } from './context/MealContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import SnapMealPage from './pages/SnapMealPage';
import SummaryPage from './pages/SummaryPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <MealProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/snap" element={<SnapMealPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
          <Navigation />
          <Toast />
        </div>
      </Router>
    </MealProvider>
  );
}

export default App;
