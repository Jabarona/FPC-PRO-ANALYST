import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Play, Star, ChevronRight, TrendingUp } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop5 = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/tabla/fase-regular/2024/apertura');
        if (res.data && res.data.tabla) {
          setTopTeams(res.data.tabla.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching top 5", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTop5();
  }, []);

  return (
    <div className="home-container">
      {/* Featured Match Banner */}
      <div className="featured-banner">
        <div className="banner-content">
          <div className="banner-header">
            <span className="badge badge-red">
              <span className="dot pulse"></span>
              PARTIDO DESTACADO
            </span>
            <span className="league-name">LIGA BETPLAY DIMAYOR</span>
          </div>

          <div className="matchup">
            <div className="team-featured">
              {topTeams.length > 0 ? (
                <img src={topTeams[0].logo} alt="Home Team" className="logo-featured bg-black" style={{objectFit: 'contain'}} />
              ) : (
                <div className="logo-featured bg-black"></div>
              )}
              <h2>{topTeams.length > 0 ? topTeams[0].equipo : 'Nacional'}</h2>
            </div>
            
            <div className="vs-container">
              <div className="vs-text">VS</div>
              <div className="match-time">20:00 GMT-5</div>
            </div>

            <div className="team-featured">
              {topTeams.length > 1 ? (
                <img src={topTeams[1].logo} alt="Away Team" className="logo-featured bg-blue" style={{objectFit: 'contain'}} />
              ) : (
                <div className="logo-featured bg-blue"></div>
              )}
              <h2>{topTeams.length > 1 ? topTeams[1].equipo : 'Millonarios'}</h2>
            </div>
          </div>

          <div className="banner-actions">
            <button className="btn-primary">
              <Activity size={18} />
              VER ANÁLISIS PRE-PARTIDO
            </button>
            <button className="btn-secondary">RECORDATORIO</button>
          </div>
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
              Top 5 Liga
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

// Simple list icon component since we need a custom one for the mockup
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
