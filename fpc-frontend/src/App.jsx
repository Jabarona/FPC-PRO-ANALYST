import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Standings from './components/Standings';
import Home from './components/Home';
import TeamDashboard from './components/TeamDashboard';
import TeamsList from './components/TeamsList';
import './App.css';
import { useAuth } from './context/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const favoriteTeam = user?.equipo_favorito || null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="main-content">
        <Topbar toggleMobileMenu={toggleMobileMenu} />
        <div className="page-content">
          {activeTab === 'standings' && <Standings />}
          {activeTab === 'home' && <Home />}
          {activeTab === 'fixtures' && <div className="placeholder">Fixtures (Próximamente)</div>}
          {activeTab === 'teams' && <TeamsList />}
          {activeTab === 'my_team' && user && <TeamDashboard teamName={favoriteTeam} />}
          {activeTab === 'analytics' && user && <div className="placeholder">Analytics (Próximamente)</div>}
        </div>
        <footer className="app-footer">
          &copy; 2026 FPC Analytics. Todos los derechos reservados.
        </footer>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </div>
  );
}

export default App;