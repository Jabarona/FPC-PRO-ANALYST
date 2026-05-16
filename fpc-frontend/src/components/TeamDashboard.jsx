import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Trophy, Navigation, Activity, CheckCircle2, MinusCircle, XCircle, RefreshCw } from 'lucide-react';
import './TeamDashboard.css';

const TeamDashboard = ({ teamName }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/equipos/${teamName}/stats`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching team stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamName) {
      fetchTeamStats();
    }
  }, [teamName]);

  if (isLoading) {
    return (
      <div className="placeholder">
        <RefreshCw size={48} className="spin text-yellow" />
        <span style={{ marginTop: '1rem' }}>Cargando datos de {teamName}...</span>
      </div>
    );
  }

  if (!data) return <div className="placeholder">No se encontraron datos para {teamName}</div>;

  const { stats, form, recent_matches } = data;

  return (
    <div className="team-container">
      {/* Team Banner */}
      <div className="team-banner">
        <div className="team-banner-overlay"></div>
        <div className="team-banner-content">
          <div className="team-header-info">
            <div className="team-logo-large">
              <span>{teamName.substring(0, 5).toUpperCase()}</span>
            </div>
            <div className="team-details">
              <h1 className="team-name-title">
                {teamName.toUpperCase()}
              </h1>
              <div className="team-badges">
                <span className="info-badge">
                  <MapPin size={14} /> {stats.ciudad}
                </span>
                <span className="info-badge">
                  <Trophy size={14} className="text-yellow" /> {stats.titulos} Títulos
                </span>
                <span className="info-badge">
                  <Navigation size={14} /> {stats.estadio}
                </span>
              </div>
            </div>
          </div>
          
          <div className="team-position">
            <span className="position-label">POSICIÓN<br/>ACTUAL</span>
            <span className="position-number">{String(stats.posicion_actual).padStart(2, '0')}<span className="position-dot"></span></span>
          </div>
        </div>
      </div>

      <div className="team-stats-grid">
        {/* Tactical Performance */}
        <div className="tactical-card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity className="text-yellow" size={20} />
              Desempeño Táctico
            </h3>
            <span className="league-badge">Liga BetPlay 2024-I</span>
          </div>
          
          <div className="circular-stats">
            <div className="circle-stat">
              <div className="circle" style={{ '--percent': stats.posesion, '--color': 'var(--accent-yellow)' }}>
                <div className="inner-circle">{stats.posesion}%</div>
              </div>
              <span className="stat-label">POSESIÓN</span>
            </div>
            <div className="circle-stat">
              <div className="circle" style={{ '--percent': stats.pases, '--color': 'var(--accent-yellow)' }}>
                <div className="inner-circle">{stats.pases}%</div>
              </div>
              <span className="stat-label">PASES</span>
            </div>
            <div className="circle-stat">
              <div className="circle" style={{ '--percent': stats.efectividad, '--color': '#ef4444' }}>
                <div className="inner-circle">{stats.efectividad}%</div>
              </div>
              <span className="stat-label">EFECTIVIDAD</span>
            </div>
            <div className="circle-stat">
              <div className="circle" style={{ '--percent': stats.duelos, '--color': 'var(--accent-yellow)' }}>
                <div className="inner-circle">{stats.duelos}%</div>
              </div>
              <span className="stat-label">DUELOS</span>
            </div>
          </div>

          <div className="horizontal-stats">
            <div className="h-stat">
              <div className="h-stat-header">
                <span>REMATES POR PARTIDO</span>
                <span>{stats.remates_promedio}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${(stats.remates_promedio / 20) * 100}%` }}></div>
              </div>
            </div>
            <div className="h-stat">
              <div className="h-stat-header">
                <span>FALTAS RECIBIDAS</span>
                <span>{stats.faltas_recibidas}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${(stats.faltas_recibidas / 20) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Guide */}
        <div className="form-card">
          <h3 className="card-title mb-4">Estado de Forma</h3>
          
          <div className="form-badges">
            {form.map((res, i) => (
              <div key={i} className={`form-badge ${res === 'W' ? 'win' : res === 'D' ? 'draw' : 'loss'}`}>
                {res}
              </div>
            ))}
          </div>

          <div className="matches-list">
            {recent_matches.map((match, i) => (
              <div key={i} className={`match-item ${match.label.includes('VICTORIA') ? 'border-green' : match.label.includes('EMPATE') ? 'border-yellow' : 'border-red'}`}>
                <div className={`match-result-icon ${match.label.includes('VICTORIA') ? 'text-green' : match.label.includes('EMPATE') ? 'text-yellow' : 'text-red'}`}>
                  {match.label.includes('VICTORIA') ? <CheckCircle2 size={24} /> : match.label.includes('EMPATE') ? <MinusCircle size={24} /> : <XCircle size={24} />}
                </div>
                <div className="match-info">
                  <h4>Vs. {match.opponent}</h4>
                  <span>{match.result} • {match.label}</span>
                </div>
                <div className="match-status">{match.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default TeamDashboard;
