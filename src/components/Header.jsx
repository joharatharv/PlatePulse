import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
  const location = useLocation();
  const { user } = useUser();

  const firstName = user?.name?.split(' ')[0] || '';

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const getTitle = () => {
    switch (location.pathname) {
      case '/snap':    return 'Snap & Analyze';
      case '/summary': return 'Daily Summary';
      case '/history': return 'Meal History';
      case '/about':   return 'About PlatePulse';
      default:         return 'My Weight Loss Journey';
    }
  };

  const getSubtitle = () => {
    switch (location.pathname) {
      case '/snap':    return 'Take a photo of your meal';
      case '/summary': return 'Track your nutrition progress';
      case '/history': return 'Your logged meals';
      case '/about':   return 'Our story, features & mission';
      default:         return firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;
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
