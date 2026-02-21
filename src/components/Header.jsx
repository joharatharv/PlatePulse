import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/snap':
        return 'Snap & Analyze';
      case '/summary':
        return 'Daily Summary';
      case '/history':
        return 'Meal History';
      default:
        return 'PlatePulse';
    }
  };

  const getSubtitle = () => {
    switch (location.pathname) {
      case '/snap':
        return 'Take a photo of your meal';
      case '/summary':
        return 'Track your nutrition goals';
      case '/history':
        return 'Your logged meals';
      default:
        return 'Smart Meal Tracking';
    }
  };

  return (
    <header className="header">
      <h1>{getTitle()}</h1>
      <p>{getSubtitle()}</p>
    </header>
  );
};

export default Header;
