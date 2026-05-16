import React from 'react';
import { Search, Bell, Settings, User, Menu } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ toggleMobileMenu }) => {
  return (
    <header className="topbar">
      <div className="topbar-main">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
      </div>
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Buscar jugador, equipos o estadísticas..." 
          className="search-input"
        />
      </div>
      <div className="topbar-actions">
        <button className="action-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="action-btn">
          <Settings size={20} />
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
