import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, ChevronDown } from 'lucide-react';
import './Standings.css';

// Mock data to demonstrate UI initially. You can replace this with actual API calls.
const mockStandings = [
  { rank: 1, name: 'Atlético Nacional', played: 15, won: 10, drawn: 3, lost: 2, gf: 28, ga: 12, gd: '+16', points: 33 },
  { rank: 2, name: 'Millonarios', played: 15, won: 9, drawn: 4, lost: 2, gf: 24, ga: 10, gd: '+14', points: 31 },
  { rank: 3, name: 'Deportes Tolima', played: 15, won: 8, drawn: 5, lost: 2, gf: 21, ga: 11, gd: '+10', points: 29 },
  { rank: 4, name: 'Junior FC', played: 15, won: 8, drawn: 4, lost: 3, gf: 25, ga: 16, gd: '+9', points: 28 },
  { rank: 5, name: 'Independiente Santa Fe', played: 15, won: 7, drawn: 6, lost: 2, gf: 19, ga: 11, gd: '+8', points: 27 },
  { rank: 6, name: 'Ind. Medellín', played: 15, won: 7, drawn: 5, lost: 3, gf: 18, ga: 14, gd: '+4', points: 26 },
  { rank: 7, name: 'Once Caldas', played: 15, won: 7, drawn: 3, lost: 5, gf: 16, ga: 14, gd: '+2', points: 24 },
  { rank: 8, name: 'Bucaramanga', played: 15, won: 6, drawn: 5, lost: 4, gf: 15, ga: 15, gd: '0', points: 23 },
  { rank: 9, name: 'Deportivo Pereira', played: 15, won: 6, drawn: 4, lost: 5, gf: 18, ga: 18, gd: '0', points: 22 },
  { rank: 10, name: 'América de Cali', played: 15, won: 5, drawn: 6, lost: 4, gf: 17, ga: 15, gd: '+2', points: 21 },
];

const Standings = () => {
  const [seasonType, setSeasonType] = useState('Apertura');
  const [year, setYear] = useState('2022');
  const [fase, setFase] = useState('Regular'); // 'Regular' o 'Cuadrangulares'
  const [grupo, setGrupo] = useState('A'); // 'A' o 'B'
  const [standings, setStandings] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('HACE 5 MIN');

  const fetchStandings = async () => {
    setIsUpdating(true);
    setIsLoading(true);
    try {
      let url = '';
      if (fase === 'Regular') {
        url = `http://localhost:8000/api/v1/tabla/fase-regular/${year}/${seasonType.toLowerCase()}`;
      } else {
        url = `http://localhost:8000/api/v1/tabla/cuadrangulares/${year}/${seasonType.toLowerCase()}/${grupo.toLowerCase()}`;
      }
      const response = await axios.get(url);
      
      if (response.data && response.data.tabla) {
        setStandings(response.data.tabla);
      } else {
        setStandings([]);
      }
    } catch (error) {
      console.error("Error fetching standings:", error);
      // Solo en caso de error de conexión/servidor apagado, mostrar mock si es fase regular
      if (fase === 'Regular') {
        setStandings(mockStandings);
      } else {
        setStandings([]);
      }
    } finally {
      setIsUpdating(false);
      setIsLoading(false);
      setLastUpdate('AHORA');
    }
  };

  useEffect(() => {
    fetchStandings();
  }, [year, seasonType, fase, grupo]);

  const handleUpdate = () => {
    fetchStandings();
  };

  return (
    <div className="standings-container">
      <div className="standings-header">
        <div>
          <h2 className="page-title">Tabla de Posiciones</h2>
          <p className="page-subtitle">
            Temporada {year} - {seasonType} {fase === 'Cuadrangulares' ? `➔ Grupo ${grupo}` : '➔ Fase Regular'} | Liga BetPlay Dimayor
          </p>
        </div>
      </div>

      <div className="standings-controls">
        <div className="tabs-container">
          {/* Selector de Torneo */}
          <div className="tabs">
            <button
              className={`tab ${seasonType === 'Apertura' ? 'active' : ''}`}
              onClick={() => setSeasonType('Apertura')}
            >
              Apertura
            </button>
            <button
              className={`tab ${seasonType === 'Clausura' ? 'active' : ''}`}
              onClick={() => setSeasonType('Clausura')}
            >
              Clausura
            </button>
          </div>

          {/* Selector de Fase */}
          <div className="tabs">
            <button
              className={`tab ${fase === 'Regular' ? 'active' : ''}`}
              onClick={() => setFase('Regular')}
            >
              Fase Regular
            </button>
            <button
              className={`tab ${fase === 'Cuadrangulares' ? 'active' : ''}`}
              onClick={() => setFase('Cuadrangulares')}
            >
              Cuadrangulares
            </button>
          </div>

          {/* Selector de Grupo (solo si es Cuadrangulares) */}
          {fase === 'Cuadrangulares' && (
            <div className="tabs animate-slide-in">
              <button
                className={`tab ${grupo === 'A' ? 'active' : ''}`}
                onClick={() => setGrupo('A')}
              >
                Grupo A
              </button>
              <button
                className={`tab ${grupo === 'B' ? 'active' : ''}`}
                onClick={() => setGrupo('B')}
              >
                Grupo B
              </button>
            </div>
          )}

          {/* Selector de Año */}
          <div className="year-selector">
            <select value={year} onChange={(e) => setYear(e.target.value)} className="year-select">
              <option value="2026">2026</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        <div className="update-info">
          <span className="last-update">ÚLTIMA ACTUALIZACIÓN: {lastUpdate}</span>
          <button className="update-btn" onClick={handleUpdate} disabled={isUpdating}>
            <RefreshCw size={16} className={isUpdating ? 'spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-team">EQUIPO</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th className="col-pts">PTS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="loading-spinner-container">
                    <RefreshCw className="spin" size={24} style={{ marginBottom: '0.5rem', color: 'var(--accent-yellow)' }} />
                    <p>Cargando posiciones oficiales...</p>
                  </div>
                </td>
              </tr>
            ) : standings.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay datos registrados de cuadrangulares para {seasonType} {year} en el {fase === 'Cuadrangulares' ? `Grupo ${grupo}` : 'Fase Regular'}.
                </td>
              </tr>
            ) : standings.map((team, index) => {
              // En Fase Regular clasifican los 8 primeros (index < 8)
              // En Cuadrangulares clasifica solo el puntero de cada grupo (index === 0)
              const isQualified = fase === 'Regular' ? index < 8 : index === 0;
              return (
                <tr key={team.equipo || team.name} className={isQualified ? 'qualified' : ''}>
                  <td className="col-rank">{String(team.posicion || team.rank || index + 1).padStart(2, '0')}</td>
                  <td className="col-team">
                    <div className="team-info">
                      <img 
                        src={team.logo || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"} 
                        alt={`Escudo de ${team.equipo || team.name}`}
                        className="team-logo-img" 
                      />
                      <span className="team-name">{team.equipo || team.name}</span>
                    </div>
                  </td>
                  <td>{team.pj || team.played}</td>
                  <td>{team.pg || team.won || 0}</td>
                  <td>{team.pe || team.drawn || 0}</td>
                  <td>{team.pp || team.lost || 0}</td>
                  <td>{team.gf}</td>
                  <td>{team.gc || team.ga}</td>
                  <td>{team.dg >= 0 ? `+${team.dg}` : team.dg}</td>
                  <td className="col-pts">{team.pts || team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;
