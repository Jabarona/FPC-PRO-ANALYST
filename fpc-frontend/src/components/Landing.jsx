import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, BarChart3, Shield, Users, Zap, Trophy, Eye } from 'lucide-react';
import './Landing.css';

const Landing = ({ onEnterApp }) => {
  const { login, register } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [equipo, setEquipo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, equipo);
      }
      onEnterApp();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const equipos2026 = [
    "Alianza Valledupar", "América", "Atl. Nacional", "Boyacá Chicó",
    "Bucaramanga", "Cúcuta", "Dep. Cali", "Dep. Pasto",
    "Deportivo Pereira", "Fortaleza", "Ind. Medellín", "Inter de Bogotá",
    "Jaguares", "Junior Barranquilla", "Llaneros", "Millonarios",
    "Once Caldas", "Santa Fe", "Tolima", "Águilas Doradas"
  ];

  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="landing-bg"></div>
      <div className="stadium-lights">
        <div className="light-beam"></div>
        <div className="light-beam"></div>
        <div className="light-beam"></div>
        <div className="light-beam"></div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <h1><em>Fútbol</em> <span>Colombiano</span></h1>
        </div>
        <div className="landing-header-actions">
          <button className="btn-header-login" onClick={() => { setShowAuth(true); setIsLogin(true); }}>
            Ingresar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        {!showAuth ? (
          <>
            <span className="hero-badge">
              <span className="dot"></span>
              ANALYTICS ELITE V2.0
            </span>

            <h2 className="hero-title">
              ANÁLISIS DE <span className="accent">FÚTBOL FPC</span>
            </h2>

            <p className="hero-subtitle">
              La plataforma definitiva para el seguimiento estadístico de la Liga BetPlay.
              Descubre métricas avanzadas, análisis táctico y rendimiento en tiempo real.
            </p>

            <div className="hero-cta">
              <button className="btn-cta-primary" onClick={() => { setShowAuth(true); setIsLogin(true); }}>
                Ingresar
              </button>
              <button className="btn-cta-register" onClick={() => { setShowAuth(true); setIsLogin(false); }}>
                Registrarse
              </button>
              <button className="btn-cta-secondary" onClick={onEnterApp}>
                Avanzar <ChevronRight size={18} />
              </button>
            </div>

            <div className="pro-banner">
              <span className="pro-icon">⚡</span>
              Regístrate y accede a tu Perfil PRO · Equipo favorito · Análisis avanzados exclusivos
            </div>
          </>
        ) : (
          /* Auth Panel */
          <div className="landing-auth-panel">
            <div className="auth-panel-header">
              <h2>{isLogin ? '¡Bienvenido de vuelta!' : 'Crear Cuenta PRO'}</h2>
              <p>{isLogin
                ? 'Accede a tus análisis avanzados y perfil personalizado.'
                : 'Únete y desbloquea estadísticas exclusivas de tu equipo favorito.'
              }</p>
            </div>

            <div className="auth-panel-tabs">
              <button
                className={`auth-panel-tab ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Ingresar
              </button>
              <button
                className={`auth-panel-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Registro
              </button>
            </div>

            <form className="auth-panel-form" onSubmit={handleSubmit}>
              {error && <div className="auth-panel-error">{error}</div>}

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="form-field">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-field">
                  <label>Equipo Favorito</label>
                  <select value={equipo} onChange={e => setEquipo(e.target.value)}>
                    <option value="">Selecciona tu equipo</option>
                    {equipos2026.map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Crear Cuenta PRO')}
              </button>
            </form>

            <div className="auth-panel-divider">o</div>

            <button className="btn-auth-guest" onClick={onEnterApp}>
              <Eye size={16} />
              Continuar como visitante
            </button>
          </div>
        )}
      </main>

      {/* Stats Bar */}
      {!showAuth && (
        <div className="landing-stats-bar">
          <div className="stat-card">
            <span className="stat-label">Temporadas</span>
            <span className="stat-value yellow">5</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Partidos Analizados</span>
            <span className="stat-value">1,500+</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Equipos Activos</span>
            <span className="stat-value blue">20</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Actualización</span>
            <span className="stat-value green">2026</span>
          </div>
        </div>
      )}

      {/* Features */}
      {!showAuth && (
        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon"><BarChart3 size={18} /></div>
            <div className="feature-text">
              <h4>Estadísticas Avanzadas</h4>
              <p>Tablas de posiciones, forma de juego, goles y rendimiento por jornada.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={18} /></div>
            <div className="feature-text">
              <h4>Perfil PRO</h4>
              <p>Regístrate y sigue a tu equipo con análisis personalizados y alertas.</p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Trophy size={18} /></div>
            <div className="feature-text">
              <h4>Fases Eliminatorias</h4>
              <p>Análisis de semifinales, finales y cuadrangulares con datos históricos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        © 2026 FPC Analytics · Pro Edition
      </footer>
    </div>
  );
};

export default Landing;
