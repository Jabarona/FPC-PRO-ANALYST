import React, { useState } from 'react';
import { Search, Bell, Settings, User, Menu, LogOut } from 'lucide-react';
import './Topbar.css';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Topbar = ({ toggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
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
          <div className="user-profile-container" style={{ position: 'relative' }}>
            <div 
              className="user-profile" 
              onClick={() => user ? setShowDropdown(!showDropdown) : setAuthModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar" style={{ backgroundColor: user ? 'var(--accent-yellow)' : 'var(--bg-input)' }}>
                {user ? (
                  <span style={{ color: 'var(--bg-dark)', fontWeight: 'bold' }}>
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>
            {showDropdown && user && (
              <div className="user-dropdown" style={{
                position: 'absolute', top: '100%', right: '0', 
                backgroundColor: 'var(--bg-card)', padding: '1rem', 
                borderRadius: '8px', border: '1px solid var(--border-color)', 
                marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 100
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
                <button 
                  onClick={() => { logout(); setShowDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '5px 0' }}
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
};

export default Topbar;
