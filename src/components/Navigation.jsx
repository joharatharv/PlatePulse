import { NavLink } from 'react-router-dom';
import { Home, Camera, BarChart3, History, Info } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/snap" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Camera size={22} />
        <span>Snap</span>
      </NavLink>
      <NavLink to="/summary" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={22} />
        <span>Summary</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <History size={22} />
        <span>History</span>
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Info size={22} />
        <span>About</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
