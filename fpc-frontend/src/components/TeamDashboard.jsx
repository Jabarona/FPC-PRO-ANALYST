import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Trophy, Navigation, Activity, CheckCircle2, MinusCircle, XCircle, RefreshCw, TrendingUp, Target, BarChart3, Award, Calendar } from 'lucide-react';
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

  if (!teamName) {
    return (
      <div className="placeholder" style={{ flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>No tienes un equipo favorito</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ve a los Ajustes o actualiza tu perfil para seleccionar un equipo favorito y ver sus métricas aquí.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="placeholder">
        <RefreshCw size={48} className="spin text-yellow" />
        <span style={{ marginTop: '1rem' }}>Cargando datos de {teamName}...</span>
      </div>
    );
  }

  if (!data) return <div className="placeholder">No se encontraron datos para {teamName}</div>;

  const { stats, form, recent_matches, logo } = data;

  // Calcular datos del historial para el mini gráfico
  const historicalEntries = stats.historical ? Object.entries(stats.historical) : [];

  return (
    <div className="team-container">
      {/* Team Banner */}
      <div className="team-banner">
        <div className="team-banner-overlay"></div>
        <div className="team-banner-content">
          <div className="team-header-info">
            <div className="team-logo-large">
              {logo ? (
                <img src={logo} alt={teamName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span>{teamName.substring(0, 5).toUpperCase()}</span>
              )}
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
                  <Navigation size={14} /> {stats.estadio}
                </span>
                <span className="info-badge">
                  <Trophy size={14} className="text-yellow" /> {stats.pts_actuales} PTS
                </span>
              </div>
            </div>
          </div>
          
          <div className="team-position">
            <span className="position-label">POSICIÓN<br/>APERTURA 2026</span>
            <span className="position-number">{String(stats.posicion_actual).padStart(2, '0')}<span className="position-dot"></span></span>
          </div>
        </div>
      </div>

      <div className="team-stats-grid">
        {/* Rendimiento 2026 */}
        <div className="tactical-card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity className="text-yellow" size={20} />
              Rendimiento Apertura 2026
            </h3>
            <span className="league-badge">Liga BetPlay 2026</span>
          </div>
          
          {/* Resumen W/D/L */}
          <div className="wdl-summary">
            <div className="wdl-item win-bg">
              <span className="wdl-count">{stats.wins}</span>
              <span className="wdl-label">Victorias</span>
              <span className="wdl-pct">{stats.win_pct}%</span>
            </div>
            <div className="wdl-item draw-bg">
              <span className="wdl-count">{stats.draws}</span>
              <span className="wdl-label">Empates</span>
              <span className="wdl-pct">{stats.draw_pct}%</span>
            </div>
            <div className="wdl-item loss-bg">
              <span className="wdl-count">{stats.losses}</span>
              <span className="wdl-label">Derrotas</span>
              <span className="wdl-pct">{stats.loss_pct}%</span>
            </div>
          </div>

          {/* Stats de goles */}
          <div className="horizontal-stats">
            <div className="h-stat">
              <div className="h-stat-header">
                <span>GOLES A FAVOR ({stats.goles_favor})</span>
                <span className="text-green">{stats.gf_avg} x partido</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill green-fill" style={{ width: `${Math.min(stats.gf_avg / 3 * 100, 100)}%` }}></div>
              </div>
            </div>
            <div className="h-stat">
              <div className="h-stat-header">
                <span>GOLES EN CONTRA ({stats.goles_contra})</span>
                <span className="text-red">{stats.gc_avg} x partido</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill red-fill" style={{ width: `${Math.min(stats.gc_avg / 3 * 100, 100)}%` }}></div>
              </div>
            </div>
            <div className="h-stat">
              <div className="h-stat-header">
                <span>DIFERENCIA DE GOL</span>
                <span className={stats.dg >= 0 ? 'text-green' : 'text-red'}>{stats.dg > 0 ? `+${stats.dg}` : stats.dg}</span>
              </div>
              <div className="progress-bar-bg">
                <div className={`progress-bar-fill ${stats.dg >= 0 ? 'green-fill' : 'red-fill'}`} style={{ width: `${Math.min(Math.abs(stats.dg) / 30 * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Guide */}
        <div className="form-card">
          <h3 className="card-title mb-4">
            <TrendingUp className="text-yellow" size={20} />
            Estado de Forma
          </h3>
          
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
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {match.opponent_logo && <img src={match.opponent_logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />}
                    Vs. {match.opponent}
                  </h4>
                  <span>{match.result} • {match.label}</span>
                </div>
                <div className="match-status">{match.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rendimiento Histórico 2022-2026 */}
        <div className="tactical-card historical-card">
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 className="text-yellow" size={20} />
              Rendimiento Histórico (2022-2026)
            </h3>
          </div>

          {/* Métricas resumen */}
          <div className="history-summary">
            <div className="history-metric">
              <span className="history-metric-value text-yellow">{stats.avg_position}°</span>
              <span className="history-metric-label">Posición Promedio</span>
            </div>
            <div className="history-metric">
              <span className="history-metric-value text-green">{stats.best_position}°</span>
              <span className="history-metric-label">Mejor Posición</span>
            </div>
            <div className="history-metric">
              <span className="history-metric-value text-red">{stats.worst_position}°</span>
              <span className="history-metric-label">Peor Posición</span>
            </div>
            <div className="history-metric">
              <span className="history-metric-value text-yellow">{stats.top4_pct}%</span>
              <span className="history-metric-label">% en Top 4</span>
            </div>
            <div className="history-metric">
              <span className="history-metric-value">{stats.top8_pct}%</span>
              <span className="history-metric-label">% en Top 8</span>
            </div>
          </div>

          {/* Tabla de historial */}
          {historicalEntries.length > 0 && (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Torneo</th>
                    <th>Pos</th>
                    <th>PJ</th>
                    <th>PG</th>
                    <th>DG</th>
                    <th>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalEntries.map(([key, val]) => (
                    <tr key={key} className={val.posicion <= 4 ? 'row-top4' : val.posicion <= 8 ? 'row-top8' : ''}>
                      <td className="tournament-name">
                        <Calendar size={12} style={{ opacity: 0.5 }} />
                        {key}
                      </td>
                      <td className={`pos-cell ${val.posicion <= 4 ? 'text-green' : val.posicion <= 8 ? 'text-yellow' : 'text-red'}`}>
                        {val.posicion}°
                      </td>
                      <td>{val.pj}</td>
                      <td>{val.pg}</td>
                      <td className={val.dg >= 0 ? 'text-green' : 'text-red'}>{val.dg > 0 ? `+${val.dg}` : val.dg}</td>
                      <td className="text-yellow font-bold">{val.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default TeamDashboard;
