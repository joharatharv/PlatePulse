import { NavLink } from 'react-router-dom';
import { Home, Camera, BarChart3, History } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/snap" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Camera size={24} />
        <span>Snap</span>
      </NavLink>
      <NavLink to="/summary" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={24} />
        <span>Summary</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <History size={24} />
        <span>History</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
