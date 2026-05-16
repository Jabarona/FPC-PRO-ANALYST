import React from 'react';
import { Home, ListOrdered, Calendar, Users, BarChart2, Star } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'standings', label: 'Standings', icon: <ListOrdered size={20} /> },
    { id: 'fixtures', label: 'Fixtures', icon: <Calendar size={20} /> },
    { id: 'teams', label: 'Equipos', icon: <Users size={20} /> },
    { id: 'my_team', label: 'Mi Equipo', icon: <Star size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="logo">
          <span className="logo-text-fpc">Fútbol</span>
          <span className="logo-text-colombiano"> Colombiano</span>
        </h1>
      </div>
      
      <div className="pro-analyst-badge">
        <div className="pro-icon">
          <BarChart2 size={16} color="black" />
        </div>
        <div className="pro-text">
          <div className="pro-title">PRO ANALYST</div>
          <div className="pro-subtitle">MODO AVANZADO ACTIVO</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
