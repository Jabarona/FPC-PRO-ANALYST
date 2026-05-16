import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Standings from './components/Standings';
import Home from './components/Home';
import TeamDashboard from './components/TeamDashboard';
import TeamSelector from './components/TeamSelector';
import TeamsList from './components/TeamsList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [favoriteTeam, setFavoriteTeam] = useState(localStorage.getItem('fav_team'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectTeam = (team) => {
    setFavoriteTeam(team);
    localStorage.setItem('fav_team', team);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      {!favoriteTeam && <TeamSelector onSelectTeam={handleSelectTeam} />}
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
          {activeTab === 'my_team' && <TeamDashboard teamName={favoriteTeam} />}
          {activeTab === 'analytics' && <div className="placeholder">Analytics (Próximamente)</div>}
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