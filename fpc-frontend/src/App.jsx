import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Standings from './components/Standings';
import Home from './components/Home';
import TeamDashboard from './components/TeamDashboard';
import TeamsList from './components/TeamsList';
import Landing from './components/Landing';
import './App.css';
import { useAuth } from './context/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const { user, loading } = useAuth();

  const favoriteTeam = user?.equipo_favorito || null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Si el usuario ya está logueado (tiene token), saltar la landing
  useEffect(() => {
    if (!loading && user) {
      setShowLanding(false);
    }
  }, [user, loading]);

  const handleEnterApp = () => {
    setShowLanding(false);
  };

  // Mostrar la landing page como portal de entrada
  if (showLanding && !user) {
    return <Landing onEnterApp={handleEnterApp} />;
  }

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