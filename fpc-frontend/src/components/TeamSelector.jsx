import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Heart } from 'lucide-react';
import './TeamSelector.css';

const TeamSelector = ({ onSelectTeam }) => {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredTeams = teams.filter(team => 
    team.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="selector-overlay">
      <div className="selector-card">
        <div className="selector-header">
          <Heart className="text-yellow" size={32} fill="#fcd34d" />
          <h2>Selecciona tu Equipo Favorito</h2>
          <p>Personalizaremos tu experiencia con los datos de tu club.</p>
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar equipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="teams-list">
          {isLoading ? (
            <div className="loading-state">Cargando equipos...</div>
          ) : filteredTeams.length > 0 ? (
            filteredTeams.map(team => (
              <button 
                key={team.nombre} 
                className="team-option"
                onClick={() => onSelectTeam(team.nombre)}
              >
                <img src={team.logo} alt={team.nombre} className="team-logo-placeholder" style={{objectFit: 'contain', backgroundColor: 'transparent'}} />
                <span>{team.nombre}</span>
              </button>
            ))
          ) : (
            <div className="no-results">No se encontraron equipos</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSelector;
