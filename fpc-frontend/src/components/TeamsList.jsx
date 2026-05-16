import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import './TeamsList.css';

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teamStatsCache, setTeamStatsCache] = useState({});

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/equipos');
        setTeams(response.data.equipos);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleExpandTeam = async (teamName) => {
    if (expandedTeam === teamName) {
      setExpandedTeam(null);
      return;
    }
    setExpandedTeam(teamName);
    
    if (!teamStatsCache[teamName]) {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/equipos/${teamName}/stats`);
        setTeamStatsCache(prev => ({ ...prev, [teamName]: res.data }));
      } catch (err) {
        console.error("Error fetching team stats:", err);
      }
    }
  };

  const filteredTeams = teams.filter(team => 
    team.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="teams-list-container">
      <div className="teams-list-header">
        <div>
          <h2 className="page-title">Equipos FPC</h2>
          <p className="page-subtitle">Explora información básica de todos los clubes</p>
        </div>
        <div className="search-container-local">
          <Search size={18} className="search-icon-local" />
          <input 
            type="text" 
            placeholder="Buscar equipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-local"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">Cargando equipos...</div>
      ) : (
        <div className="teams-grid">
          {filteredTeams.map(team => {
            const isExpanded = expandedTeam === team.nombre;
            const stats = teamStatsCache[team.nombre];

            return (
              <div 
                key={team.nombre} 
                className={`team-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => handleExpandTeam(team.nombre)}
              >
                <div className="team-card-header">
                  <div className="team-card-logo-container">
                    <img src={team.logo} alt={team.nombre} className="team-card-logo" />
                  </div>
                  <h3 className="team-card-name">{team.nombre}</h3>
                </div>
                
                {isExpanded && (
                  <div className="team-card-details">
                    {stats ? (
                      <>
                        <div className="detail-row">
                          <span className="detail-label">Estadio:</span>
                          <span className="detail-value">{stats.stats.estadio}</span>
                        </div>
                        <div className="detail-row form-guide">
                          <span className="detail-label">Últimos 5:</span>
                          <div className="form-badges-small">
                            {stats.form.map((res, i) => (
                              <span key={i} className={`form-badge-sm ${res.toLowerCase()}`}>
                                {res}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="loading-details">Cargando datos...</div>
                    )}
                  </div>
                )}
                
                {!isExpanded && <div className="team-card-action">Ver más info &darr;</div>}
              </div>
            );
          })}
          {filteredTeams.length === 0 && (
            <div className="no-results">No se encontraron equipos que coincidan con la búsqueda.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamsList;
