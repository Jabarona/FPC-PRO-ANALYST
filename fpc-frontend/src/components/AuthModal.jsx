import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [equipo, setEquipo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrió un error. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-header">
          <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p>{isLogin ? 'Accede a tus análisis avanzados.' : 'Únete a FPC Analyst y apoya a tu equipo.'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Registro
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com" 
              required 
            />
          </div>

          <div className="form-group">
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
            <div className="form-group">
              <label>Equipo Favorito (Opcional)</label>
              <select value={equipo} onChange={e => setEquipo(e.target.value)}>
                <option value="">Selecciona tu equipo</option>
                <option value="America de Cali">América de Cali</option>
                <option value="Atletico Nacional">Atlético Nacional</option>
                <option value="Millonarios">Millonarios</option>
                <option value="Independiente Medellin">Independiente Medellín</option>
                <option value="Deportivo Cali">Deportivo Cali</option>
                <option value="Junior">Junior FC</option>
                <option value="Santa Fe">Independiente Santa Fe</option>
                <option value="Bucaramanga">Bucaramanga</option>
              </select>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarme')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
