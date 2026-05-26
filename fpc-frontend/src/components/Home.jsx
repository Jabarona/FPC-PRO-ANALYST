import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Shield, History, Trophy, TrendingUp, Calendar, MapPin, Award } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [nacionalStats, setNacionalStats] = useState(null);
  const [juniorStats, setJuniorStats] = useState(null);
  const [h2hAnalisis, setH2hAnalisis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [nacionalRes, juniorRes, h2hRes] = await Promise.all([
          axios.get('http://localhost:8000/api/v1/equipos/Atletico Nacional/stats'),
          axios.get('http://localhost:8000/api/v1/equipos/Junior/stats'),
          axios.get('http://localhost:8000/api/v1/analisis/h2h?team_a=Atletico Nacional&team_b=Junior&limit=5')
        ]);
        setNacionalStats(nacionalRes.data);
        setJuniorStats(juniorRes.data);
        setH2hAnalisis(h2hRes.data);
      } catch (err) {
        console.error("Error fetching data for finalists", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <div className="no-data-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="dot pulse" style={{ display: 'inline-block', marginRight: '10px' }}></div>
          Cargando datos de la Gran Final BetPlay 2026 y Análisis H2H...
        </div>
      </div>
    );
  }

  // Fallbacks de estadísticas por si no se conecta bien
  const nac = nacionalStats?.stats || {
    pts_actuales: 40,
    pj_total: 19,
    wins: 13,
    draws: 1,
    losses: 5,
    goles_favor: 35,
    goles_contra: 15,
    dg: 20,
    posicion_actual: 1,
    estadio: "Atanasio Girardot",
    ciudad: "Medellín"
  };

  const jun = juniorStats?.stats || {
    pts_actuales: 35,
    pj_total: 19,
    wins: 11,
    draws: 2,
    losses: 6,
    goles_favor: 31,
    goles_contra: 24,
    dg: 7,
    posicion_actual: 2,
    estadio: "Metropolitano Roberto Meléndez",
    ciudad: "Barranquilla"
  };

  const h2h = h2hAnalisis || {
    total_partidos: 5,
    victorias_a: 2,
    victorias_b: 1,
    empates: 2,
    porcentaje_a: 40.0,
    porcentaje_b: 20.0,
    porcentaje_empate: 40.0,
    goles_a: 9,
    goles_b: 4,
    goles_promedio: 2.6,
    ventaja: "Atletico Nacional",
    justificacion: "Tiene 1 victoria(s) más en los últimos 5 encuentros.",
    partidos: [
      { season: 2026, jornada: "Apertura - 3", local: "Junior", goles_local: 0, goles_visitante: 4, visitante: "Atletico Nacional", resultado: "Ganó Atletico Nacional" },
      { season: 2025, jornada: "Apertura - 20", local: "Atletico Nacional", goles_local: 2, goles_visitante: 3, visitante: "Junior", resultado: "Ganó Junior" },
      { season: 2024, jornada: "Clausura - 10", local: "Atletico Nacional", goles_local: 2, goles_visitante: 0, visitante: "Junior", resultado: "Ganó Atletico Nacional" },
      { season: 2024, jornada: "Apertura - 10", local: "Junior", goles_local: 0, goles_visitante: 0, visitante: "Atletico Nacional", resultado: "Empate" },
      { season: 2023, jornada: "Clausura - 12", local: "Junior", goles_local: 1, goles_visitante: 1, visitante: "Atletico Nacional", resultado: "Empate" }
    ]
  };

  const nacLogo = nacionalStats?.logo || "https://media.api-sports.io/football/teams/1137.png";
  const junLogo = juniorStats?.logo || "https://media.api-sports.io/football/teams/1135.png";

  return (
    <div className="home-container">
      {/* Gran Final Banner */}
      <div className="featured-banner final-banner">
        <div className="banner-content" style={{ maxWidth: '1000px' }}>
          <div className="banner-header">
            <span className="badge badge-gold">
              <span className="dot pulse"></span>
              LA GRAN FINAL LIGA BETPLAY 2026
            </span>
            <span className="league-subtitle">BARRANQUILLA VS MEDELLÍN</span>
          </div>

          <div className="finalist-versus-grid">
            {/* Junior */}
            <div className="finalist-column junior-side">
              <img src={junLogo} alt="Junior FC" className="finalist-logo-lg animate-bounce-slow" />
              <h2>Junior FC</h2>
              <span className="finalist-rank">Sublíder de Fase Regular</span>
            </div>

            <div className="finalist-vs-middle">
              <div className="trophy-glow">
                <Trophy size={48} className="icon-gold" />
              </div>
              <span className="vs-large">VS</span>
              <span className="match-status-label">IDA & VUELTA</span>
            </div>

            {/* Atletico Nacional */}
            <div className="finalist-column nacional-side">
              <img src={nacLogo} alt="Atl. Nacional" className="finalist-logo-lg animate-bounce-slow" />
              <h2>Atl. Nacional</h2>
              <span className="finalist-rank">Líder de Fase Regular</span>
            </div>
          </div>

          <div className="final-matches-schedule">
            <div className="schedule-card">
              <span className="schedule-title">Partido de Ida</span>
              <div className="schedule-detail">
                <MapPin size={14} className="text-yellow" />
                <span>Estadio Metropolitano, Barranquilla</span>
              </div>
              <div className="schedule-detail">
                <Calendar size={14} className="text-yellow" />
                <span>Próximamente (Definición de fechas)</span>
              </div>
            </div>
            <div className="schedule-card">
              <span className="schedule-title">Partido de Vuelta (Cierre)</span>
              <div className="schedule-detail">
                <MapPin size={14} className="text-yellow" />
                <span>Estadio Atanasio Girardot, Medellín</span>
              </div>
              <div className="schedule-detail">
                <Calendar size={14} className="text-yellow" />
                <span>Próximamente (Definición de fechas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison & Stats section */}
      <div className="final-analysis-section">
        <div className="section-header">
          <h3 className="section-title">
            <Award className="icon-gold" size={24} />
            Comparativa de Rendimiento (Fase Regular 2026)
          </h3>
        </div>

        <div className="stats-comparison-grid">
          {/* Junior Stats */}
          <div className="team-stats-card junior-card">
            <div className="card-team-header">
              <img src={junLogo} alt="Junior" className="logo-card-header" />
              <h4>JUNIOR BARRANQUILLA</h4>
            </div>
            <div className="stats-list">
              <div className="stat-row">
                <span>Puntos Totales</span>
                <span className="stat-value text-red">{jun.pts_actuales} pts</span>
              </div>
              <div className="stat-row">
                <span>Partidos Jugados</span>
                <span>{jun.pj_total}</span>
              </div>
              <div className="stat-row">
                <span>Victorias / Empates / Derrotas</span>
                <span>{jun.wins} / {jun.draws} / {jun.losses}</span>
              </div>
              <div className="stat-row">
                <span>Goles Anotados / Recibidos</span>
                <span>{jun.goles_favor} / {jun.goles_contra}</span>
              </div>
              <div className="stat-row">
                <span>Diferencia de Goles</span>
                <span className={jun.dg >= 0 ? "text-green" : "text-red"}>
                  {jun.dg >= 0 ? `+${jun.dg}` : jun.dg}
                </span>
              </div>
              <div className="stat-row">
                <span>Posición de Clasificación</span>
                <span className="stat-position">#2</span>
              </div>
            </div>
          </div>

          {/* Atletico Nacional Stats */}
          <div className="team-stats-card nacional-card">
            <div className="card-team-header">
              <img src={nacLogo} alt="Nacional" className="logo-card-header" />
              <h4>ATLÉTICO NACIONAL</h4>
            </div>
            <div className="stats-list">
              <div className="stat-row">
                <span>Puntos Totales</span>
                <span className="stat-value text-green">{nac.pts_actuales} pts</span>
              </div>
              <div className="stat-row">
                <span>Partidos Jugados</span>
                <span>{nac.pj_total}</span>
              </div>
              <div className="stat-row">
                <span>Victorias / Empates / Derrotas</span>
                <span>{nac.wins} / {nac.draws} / {nac.losses}</span>
              </div>
              <div className="stat-row">
                <span>Goles Anotados / Recibidos</span>
                <span>{nac.goles_favor} / {nac.goles_contra}</span>
              </div>
              <div className="stat-row">
                <span>Diferencia de Goles</span>
                <span className={nac.dg >= 0 ? "text-green" : "text-red"}>
                  {nac.dg >= 0 ? `+${nac.dg}` : nac.dg}
                </span>
              </div>
              <div className="stat-row">
                <span>Posición de Clasificación</span>
                <span className="stat-position text-green">#1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Head to Head (H2H) Analytical section */}
      <div className="h2h-analysis-section">
        <div className="section-header">
          <h3 className="section-title">
            <History size={24} className="text-yellow" />
            Análisis de Enfrentamientos Directos (Últimos {h2h.total_partidos} H2H)
          </h3>
          <span className="h2h-badge">EVALUADOR DINÁMICO</span>
        </div>

        <div className="h2h-layout">
          <div className="h2h-results-panel">
            <h4 className="panel-title">Historial Reciente (Liga BetPlay)</h4>
            <div className="h2h-matches-list">
              {h2h.partidos.map((m, idx) => {
                // Formato limpio de nombres: bolds consistentes e independientes de quién sea local
                const isNacLocal = m.local.toLowerCase().includes("nacional");
                const isJunLocal = m.local.toLowerCase().includes("junior");
                
                return (
                  <div key={idx} className="h2h-match-row">
                    <div className="h2h-match-meta">
                      <span>Temp. {m.season} | {m.jornada.split(" - ")[0]}</span>
                    </div>
                    <div className="h2h-match-scores">
                      <span className="h2h-team-bold h2h-team-local">{m.local}</span>
                      <span className="h2h-score-box">{m.goles_local} - {m.goles_visitante}</span>
                      <span className="h2h-team-bold h2h-team-visitor">{m.visitante}</span>
                    </div>
                    <div className={`h2h-result-label ${m.resultado.toLowerCase().replace(/ /g, "-")}`}>
                      {m.resultado}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h2h-verdict-panel">
            <h4 className="panel-title">Diagnóstico y Probabilidades</h4>
            <div className="verdict-card">
              <div className="verdict-header">
                <TrendingUp size={20} className="text-yellow" />
                <span>MÉTRICAS ESTIMADAS (ÚLTIMOS 5 DUELOS)</span>
              </div>
              
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                    <span>Probabilidad Victoria Atl. Nacional:</span>
                    <strong>{h2h.porcentaje_a}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${h2h.porcentaje_a}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                    <span>Probabilidad Victoria Junior:</span>
                    <strong>{h2h.porcentaje_b}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${h2h.porcentaje_b}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                    <span>Probabilidad de Empate:</span>
                    <strong>{h2h.porcentaje_empate}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${h2h.porcentaje_empate}%`, height: '100%', background: '#64748b', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Goles Promedio por Partido:</span>
                    <strong style={{ color: 'var(--accent-yellow)', fontSize: '1rem' }}>{h2h.goles_promedio}</strong>
                  </div>
                </div>
              </div>

              <div className="verdict-banner-footer" style={{ marginTop: '0.75rem' }}>
                <strong>Ventaja estimada:</strong> {h2h.ventaja === "Ninguno" ? "Ninguno (Historial parejo)" : h2h.ventaja.toUpperCase()}
                <br />
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{h2h.justificacion}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
