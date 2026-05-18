import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Star, ChevronRight, TrendingUp, Shield, History, Trophy, Sparkles } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [topTeams, setTopTeams] = useState([]);
  const [semifinals, setSemifinals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semisLoading, setSemisLoading] = useState(true);

  // Fallback de semifinales por si los datos no están cargados completamente en la DB
  const mockSemifinals = [
    {
      "equipo_1": "Atl. Nacional",
      "logo_1": "https://media.api-sports.io/football/teams/1137.png",
      "equipo_2": "Tolima",
      "logo_2": "https://media.api-sports.io/football/teams/1142.png",
      "ida": {
        "local": "Tolima",
        "logo_local": "https://media.api-sports.io/football/teams/1142.png",
        "visitante": "Atl. Nacional",
        "logo_visitante": "https://media.api-sports.io/football/teams/1137.png",
        "goles_local": 0,
        "goles_visitante": 1
      },
      "vuelta": {
        "local": "Atl. Nacional",
        "logo_local": "https://media.api-sports.io/football/teams/1137.png",
        "visitante": "Tolima",
        "logo_visitante": "https://media.api-sports.io/football/teams/1142.png",
        "goles_local": null,
        "goles_visitante": null
      },
      "global_1": 1,
      "global_2": 0,
      "ganador": null
    },
    {
      "equipo_1": "Junior Barranquilla",
      "logo_1": "https://media.api-sports.io/football/teams/1135.png",
      "equipo_2": "Santa Fe",
      "logo_2": "https://media.api-sports.io/football/teams/1139.png",
      "ida": {
        "local": "Santa Fe",
        "logo_local": "https://media.api-sports.io/football/teams/1139.png",
        "visitante": "Junior Barranquilla",
        "logo_visitante": "https://media.api-sports.io/football/teams/1135.png",
        "goles_local": 1,
        "goles_visitante": 1
      },
      "vuelta": {
        "local": "Junior Barranquilla",
        "logo_local": "https://media.api-sports.io/football/teams/1135.png",
        "visitante": "Santa Fe",
        "logo_visitante": "https://media.api-sports.io/football/teams/1139.png",
        "goles_local": null,
        "goles_visitante": null
      },
      "global_1": 1,
      "global_2": 1,
      "ganador": null
    }
  ];

  useEffect(() => {
    const fetchTop5 = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/tabla/fase-regular/2026/apertura');
        if (res.data && res.data.tabla) {
          setTopTeams(res.data.tabla.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching top 5", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSemifinals = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/tabla/fases-eliminatorias/2026/apertura/semifinal');
        if (res.data && res.data.parejas && res.data.parejas.length > 0) {
          setSemifinals(res.data.parejas);
        } else {
          setSemifinals(mockSemifinals);
        }
      } catch (err) {
        console.error("Error fetching 2026 semifinals", err);
        setSemifinals(mockSemifinals);
      } finally {
        setSemisLoading(false);
      }
    };

    fetchTop5();
    fetchSemifinals();
  }, []);

  // Lógica de Marcador Global Dinámico
  const calculateGlobalScore = (pair) => {
    let g1 = 0;
    let g2 = 0;
    let playedAny = false;

    if (pair.ida && pair.ida.goles_local !== null && pair.ida.goles_visitante !== null) {
      playedAny = true;
      if (pair.ida.local === pair.equipo_1) {
        g1 += pair.ida.goles_local;
        g2 += pair.ida.goles_visitante;
      } else {
        g2 += pair.ida.goles_local;
        g1 += pair.ida.goles_visitante;
      }
    }

    if (pair.vuelta && pair.vuelta.goles_local !== null && pair.vuelta.goles_visitante !== null) {
      playedAny = true;
      if (pair.vuelta.local === pair.equipo_1) {
        g1 += pair.vuelta.goles_local;
        g2 += pair.vuelta.goles_visitante;
      } else {
        g2 += pair.vuelta.goles_local;
        g1 += pair.vuelta.goles_visitante;
      }
    }

    return playedAny ? { g1, g2 } : { g1: null, g2: null };
  };

  // Lógica para determinar Estado Actual de la Serie
  const getSerieStateText = (pair) => {
    const { g1, g2 } = calculateGlobalScore(pair);
    const isVueltaPlayed = pair.vuelta && pair.vuelta.goles_local !== null;
    
    if (isVueltaPlayed) {
      if (g1 > g2) {
        return `${pair.equipo_1} clasifica a la Gran Final con un marcador global de ${g1}-${g2}.`;
      } else if (g2 > g1) {
        return `${pair.equipo_2} clasifica a la Gran Final con un marcador global de ${g2}-${g1}.`;
      } else {
        return `Serie empatada ${g1}-${g2} en el global. Definición por penaltis en curso para definir el finalista.`;
      }
    }

    const diff = (g1 || 0) - (g2 || 0);
    const team1 = pair.equipo_1;
    const team2 = pair.equipo_2;

    if (diff === 0) {
      return `La serie está completamente empatada. Cualquier equipo que gane el partido de vuelta en los 90' clasificará directo; un nuevo empate enviará la definición a los tiros de penalti.`;
    }

    if (diff > 0) {
      const awayTeam = pair.vuelta ? pair.vuelta.visitante : team2;
      const homeTeam = pair.vuelta ? pair.vuelta.local : team1;
      return `${team1} tiene ventaja de +${diff} en la ida. Como visitante en la vuelta, ${awayTeam} debe ganar por ${diff + 1} goles o más para clasificar directo, o ganar por exactamente ${diff} gol para forzar penales.`;
    } else {
      const absDiff = Math.abs(diff);
      const awayTeam = pair.vuelta ? pair.vuelta.visitante : team1;
      const homeTeam = pair.vuelta ? pair.vuelta.local : team2;
      return `${team2} tiene ventaja de +${absDiff} en la ida. Como visitante en la vuelta, ${awayTeam} debe ganar por ${absDiff + 1} goles o más para clasificar directo, o ganar por exactamente ${absDiff} gol para forzar penales.`;
    }
  };

  // Mapeo analítico de H2H y Fase Regular
  const getAnalyticalData = (team1, team2) => {
    const key = [team1.toLowerCase(), team2.toLowerCase()].sort().join('_');
    
    const data = {
      'atl. nacional_tolima': {
        h2h: '4 enfrentamientos definitivos en las finales del 2022-I y 2024-II. Atl. Nacional ganó ambas series coronándose campeón de liga en ambas ocasiones.',
        regularSeason: 'Atl. Nacional finalizó la Fase Regular como la mejor ofensiva del torneo con 35 goles a favor (+20 DG). Deportes Tolima responde con una defensa extremadamente compacta, habiendo encajado solo 17 goles en 19 encuentros.'
      },
      'junior barranquilla_santa fe': {
        h2h: 'Enfrentamiento inédito en fases de eliminación directa directa (cuadrangulares o finales) entre 2022 y 2025. Esta semifinal 2026 representa una serie histórica reciente.',
        regularSeason: 'Junior FC llega con un ataque letal de 31 goles a favor y 35 puntos acumulados en la fase regular. Santa Fe destaca por su equilibrio defensivo, concediendo solo 22 goles en 19 partidos.'
      }
    };
    
    return data[key] || {
      h2h: 'Historial parejo en fases de definición. Serie altamente disputada en los últimos torneos.',
      regularSeason: 'Ambos equipos llegan con rendimiento similar en la Fase Regular, demostrando gran consistencia táctica.'
    };
  };

  // Helper para obtener el marcador de cada equipo en la ida/vuelta
  const getLegScore = (legData, teamName) => {
    if (!legData || legData.goles_local === null) return '-';
    return legData.local === teamName ? legData.goles_local : legData.goles_visitante;
  };

  const match1 = semifinals[0] || mockSemifinals[0];
  const match2 = semifinals[1] || mockSemifinals[1];

  const m1LocalName = match1.vuelta ? match1.vuelta.local : match1.equipo_1;
  const m1LocalLogo = match1.vuelta ? match1.vuelta.logo_local : match1.logo_1;
  const m1VisitanteName = match1.vuelta ? match1.vuelta.visitante : match1.equipo_2;
  const m1VisitanteLogo = match1.vuelta ? match1.vuelta.logo_visitante : match1.logo_2;

  const m2LocalName = match2.vuelta ? match2.vuelta.local : match2.equipo_1;
  const m2LocalLogo = match2.vuelta ? match2.vuelta.logo_local : match2.logo_1;
  const m2VisitanteName = match2.vuelta ? match2.vuelta.visitante : match2.equipo_2;
  const m2VisitanteLogo = match2.vuelta ? match2.vuelta.logo_visitante : match2.logo_2;

  return (
    <div className="home-container">
      {/* Featured Match Banner */}
      <div className="featured-banner" style={{ padding: '2.5rem 2rem' }}>
        <div className="banner-content" style={{ maxWidth: '1000px' }}>
          <div className="banner-header">
            <span className="badge badge-red">
              <span className="dot pulse"></span>
              DEFINICIÓN: SEMIFINALES VUELTA 2026
            </span>
            <span className="league-name">LIGA BETPLAY LIGA 2026</span>
          </div>

          <div className="featured-matchups-grid">
            {/* Llave 1 */}
            <div className="featured-match-column">
              <span className="featured-match-header-sm">Llave 1 - Definición</span>
              <div className="matchup-row-featured">
                <div className="team-featured-sm">
                  <img src={m1LocalLogo} alt={m1LocalName} className="logo-featured-sm" style={{ objectFit: 'contain' }} />
                  <h3>{m1LocalName}</h3>
                </div>
                <div className="vs-container-sm">
                  <span className="vs-text-sm">VS</span>
                  <span className="match-time-sm" style={{ fontWeight: '700', color: 'var(--accent-yellow)', fontSize: '0.6rem' }}>
                    Atanasio Girardot
                  </span>
                  <span className="match-time-sm" style={{ fontSize: '0.55rem', opacity: 0.8, letterSpacing: '0.5px' }}>
                    Ida: {match1.ida ? `${match1.ida.goles_local} - ${match1.ida.goles_visitante}` : '0 - 1'} (Tol - Nac)
                  </span>
                </div>
                <div className="team-featured-sm">
                  <img src={m1VisitanteLogo} alt={m1VisitanteName} className="logo-featured-sm" style={{ objectFit: 'contain' }} />
                  <h3>{m1VisitanteName}</h3>
                </div>
              </div>
            </div>

            {/* Llave 2 */}
            <div className="featured-match-column">
              <span className="featured-match-header-sm">Llave 2 - Definición</span>
              <div className="matchup-row-featured">
                <div className="team-featured-sm">
                  <img src={m2LocalLogo} alt={m2LocalName} className="logo-featured-sm" style={{ objectFit: 'contain' }} />
                  <h3>{m2LocalName}</h3>
                </div>
                <div className="vs-container-sm">
                  <span className="vs-text-sm">VS</span>
                  <span className="match-time-sm" style={{ fontWeight: '700', color: 'var(--accent-yellow)', fontSize: '0.6rem' }}>
                    Metropolitano
                  </span>
                  <span className="match-time-sm" style={{ fontSize: '0.55rem', opacity: 0.8, letterSpacing: '0.5px' }}>
                    Ida: {match2.ida ? `${match2.ida.goles_local} - ${match2.ida.goles_visitante}` : '1 - 1'} (StFe - Jun)
                  </span>
                </div>
                <div className="team-featured-sm">
                  <img src={m2VisitanteLogo} alt={m2VisitanteName} className="logo-featured-sm" style={{ objectFit: 'contain' }} />
                  <h3>{m2VisitanteName}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-actions" style={{ marginTop: '0.5rem' }}>
            <button className="btn-primary">
              <Activity size={18} />
              VER ANÁLISIS PRE-PARTIDOS
            </button>
            <button className="btn-secondary">RECORDATORIOS</button>
          </div>
        </div>
      </div>

      {/* DEFINICIÓN SEMIFINALES LIGA BETPLAY 2026 */}
      <div className="semifinals-section">
        <div className="section-header" style={{ marginBottom: '0.5rem' }}>
          <h3 className="section-title">
            <Trophy className="text-yellow" size={22} style={{ color: 'var(--accent-yellow)' }} />
            Definición Semifinales Liga BetPlay 2026
          </h3>
          <span className="league-name" style={{ fontSize: '0.75rem' }}>ANÁLISIS DE DATOS Y LOGS</span>
        </div>

        <div className="semifinals-grid">
          {semisLoading ? (
            <div className="no-data-card" style={{ gridColumn: '1/-1', padding: '2rem' }}>
              Cargando análisis de Semifinales...
            </div>
          ) : (
            semifinals.map((pair, index) => {
              const { g1, g2 } = calculateGlobalScore(pair);
              const isVueltaPlayed = pair.vuelta && pair.vuelta.goles_local !== null;
              const globalText = g1 !== null ? `Global: ${g1} - ${g2}` : 'Global: 0 - 0';
              const analysis = getAnalyticalData(pair.equipo_1, pair.equipo_2);
              const winnerName = g1 > g2 ? pair.equipo_1 : g2 > g1 ? pair.equipo_2 : null;

              return (
                <div key={index} className="semifinal-card">
                  <div className="semifinal-header">
                    <span className="semifinal-title">Llave {index + 1} - Semifinal 2026</span>
                    {isVueltaPlayed && winnerName ? (
                      <span className="finalist-badge">
                        🏆 CLASIFICADO A LA GRAN FINAL: {winnerName}
                      </span>
                    ) : (
                      <span className="global-badge">
                        {globalText}
                      </span>
                    )}
                  </div>

                  <div className="match-scores-container">
                    {/* Fila del Equipo 1 */}
                    <div className="match-score-row">
                      <div className="match-score-team">
                        <img 
                          src={pair.logo_1 || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"} 
                          alt={pair.equipo_1} 
                          className="match-score-logo" 
                        />
                        <span>{pair.equipo_1}</span>
                      </div>
                      <div className="match-score-values">
                        <span className="match-score-val" title="Goles Ida">{getLegScore(pair.ida, pair.equipo_1)}</span>
                        <span className="match-score-val" title="Goles Vuelta">{getLegScore(pair.vuelta, pair.equipo_1)}</span>
                        <span className="match-score-val final-score" title="Total Global">{g1 !== null ? g1 : '-'}</span>
                      </div>
                    </div>

                    {/* Fila del Equipo 2 */}
                    <div className="match-score-row">
                      <div className="match-score-team">
                        <img 
                          src={pair.logo_2 || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"} 
                          alt={pair.equipo_2} 
                          className="match-score-logo" 
                        />
                        <span>{pair.equipo_2}</span>
                      </div>
                      <div className="match-score-values">
                        <span className="match-score-val" title="Goles Ida">{getLegScore(pair.ida, pair.equipo_2)}</span>
                        <span className="match-score-val" title="Goles Vuelta">{getLegScore(pair.vuelta, pair.equipo_2)}</span>
                        <span className="match-score-val final-score" title="Total Global">{g2 !== null ? g2 : '-'}</span>
                      </div>
                    </div>

                    {/* Fila de Status */}
                    <div className="match-score-row" style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      <span className="match-events" style={{ fontSize: '0.7rem' }}>
                        Ida: JUGADO (FT) | Vuelta: {isVueltaPlayed ? 'JUGADO (FT)' : 'PENDIENTE (NS)'}
                      </span>
                      <span className={`match-status-badge ${isVueltaPlayed ? 'ft' : 'ns'}`}>
                        {isVueltaPlayed ? 'Serie Definida' : 'Vuelta pendiente'}
                      </span>
                    </div>
                  </div>

                  {/* Bloque Analítico por Llave */}
                  <div className="analytics-block">
                    {/* 1. Estado Actual de la Serie */}
                    <div className="analytics-item">
                      <div className="analytics-icon-wrapper">
                        <Activity size={15} />
                      </div>
                      <div className="analytics-text-container">
                        <span className="analytics-label">Estado de la Serie</span>
                        <span className="analytics-content">{getSerieStateText(pair)}</span>
                      </div>
                    </div>

                    {/* 2. Historial Directo (H2H) */}
                    <div className="analytics-item">
                      <div className="analytics-icon-wrapper">
                        <History size={15} />
                      </div>
                      <div className="analytics-text-container">
                        <span className="analytics-label">Historial Definiciones (2022-2025)</span>
                        <span className="analytics-content">{analysis.h2h}</span>
                      </div>
                    </div>

                    {/* 3. Comparativa de Rendimiento Todos contra Todos */}
                    <div className="analytics-item">
                      <div className="analytics-icon-wrapper">
                        <Shield size={15} />
                      </div>
                      <div className="analytics-text-container">
                        <span className="analytics-label">Desempeño Todos contra Todos 2026</span>
                        <span className="analytics-content">{analysis.regularSeason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="home-grid">
        {/* Live Matches Section */}
        <div className="live-matches-section">
          <div className="section-header">
            <h3 className="section-title">
              <Activity className="icon-red" size={20} />
              Partidos en Vivo
            </h3>
            <a href="#" className="view-all">Ver Todos</a>
          </div>

          <div className="live-cards">
            {/* Live Card 1 */}
            <div className="live-card">
              <div className="live-card-header">
                <span className="match-minute">Min. 74'</span>
                <span className="badge badge-live">LIVE</span>
              </div>
              <div className="live-teams">
                <div className="live-team">
                  <div className="team-info-sm">
                    {topTeams.length > 2 ? <img src={topTeams[2].logo} className="logo-sm" alt="logo" style={{objectFit: 'contain'}}/> : <div className="logo-sm"></div>}
                    <span>{topTeams.length > 2 ? topTeams[2].equipo : 'Ind. Santa Fe'}</span>
                  </div>
                  <span className="score highlight">2</span>
                </div>
                <div className="live-team">
                  <div className="team-info-sm">
                    {topTeams.length > 3 ? <img src={topTeams[3].logo} className="logo-sm" alt="logo" style={{objectFit: 'contain'}}/> : <div className="logo-sm"></div>}
                    <span>{topTeams.length > 3 ? topTeams[3].equipo : 'América de Cali'}</span>
                  </div>
                  <span className="score highlight">1</span>
                </div>
              </div>
              <div className="live-card-footer">
                <span className="match-events">Goles: Rodallega 12', 45' - Holgado 34'</span>
                <TrendingUp size={16} className="icon-muted" />
              </div>
            </div>

            {/* Live Card 2 */}
            <div className="live-card">
              <div className="live-card-header">
                <span className="match-minute">Min. 12'</span>
                <span className="badge badge-live">LIVE</span>
              </div>
              <div className="live-teams">
                <div className="live-team">
                  <div className="team-info-sm">
                    {topTeams.length > 4 ? <img src={topTeams[4].logo} className="logo-sm" alt="logo" style={{objectFit: 'contain'}}/> : <div className="logo-sm"></div>}
                    <span>{topTeams.length > 4 ? topTeams[4].equipo : 'Junior FC'}</span>
                  </div>
                  <span className="score highlight">0</span>
                </div>
                <div className="live-team">
                  <div className="team-info-sm">
                    <div className="logo-sm" style={{backgroundColor: '#64748b'}}></div>
                    <span>Pereira</span>
                  </div>
                  <span className="score highlight">0</span>
                </div>
              </div>
              <div className="live-card-footer">
                <span className="match-events">Posesión: 65% - 35%</span>
                <TrendingUp size={16} className="icon-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Liga Section */}
        <div className="top-5-section">
          <div className="section-header">
            <h3 className="section-title">
              <ListIcon />
              Top 5 Liga 2026
            </h3>
          </div>
          
          <div className="mini-standings">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th className="text-left">EQUIPO</th>
                  <th>PJ</th>
                  <th>G</th>
                  <th>DG</th>
                  <th className="text-yellow">PTS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{padding: '2rem'}}>Cargando...</td></tr>
                ) : (
                  topTeams.map((team, index) => (
                    <tr key={team.equipo}>
                      <td className={index === 0 ? "text-yellow font-bold" : "text-white"}>{index + 1}</td>
                      <td className="team-cell">
                        <img src={team.logo} alt="logo" className="logo-xs" style={{objectFit: 'contain', backgroundColor: 'transparent'}} />
                        {team.equipo}
                      </td>
                      <td>{team.pj}</td>
                      <td>{team.pg}</td>
                      <td className="text-green">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                      <td className="text-yellow font-bold">{team.pts}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

export default Home;
