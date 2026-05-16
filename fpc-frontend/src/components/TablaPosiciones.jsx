// src/components/TablaPosiciones.jsx
import React, { useState, useEffect } from 'react';

export default function TablaPosiciones() {
  // Estados para armar la petición a la API
  const [anio, setAnio] = useState(2022);
  const [fase, setFase] = useState('fase-regular'); // 'fase-regular' o 'cuadrangulares'
  const [torneo, setTorneo] = useState('apertura'); // 'apertura' o 'clausura'
  const [grupo, setGrupo] = useState('A');         // 'A' o 'B' (solo para cuadrangulares)
  
  const [tabla, setTabla] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Función que conecta con el contenedor Docker de FastAPI
  const obtenerDatos = async () => {
    setCargando(true);
    setError(null);
    
    // Construimos la URL dinámicamente según la pestaña activa
    let url = `http://localhost:8000/api/v1/tabla/fase-regular/${anio}/${torneo}`;
    if (fase === 'cuadrangulares') {
      url = `http://localhost:8000/api/v1/tabla/cuadrangulares/${anio}/${torneo}/${grupo}`;
    }

    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error("No se pudo conectar con la API de Docker");
      const data = await respuesta.json();
      setTabla(data.tabla || []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los datos. ¿Está encendido el contenedor de Docker?");
    } finally {
      setCargando(false);
    }
  };

  // Cada vez que cambie un filtro (año, torneo, fase o grupo), se recarga la data automáticamente
  useEffect(() => {
    obtenerDatos();
  }, [anio, fase, torneo, grupo]);

  return (
    <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', color: '#fff' }}>
      
      {/* --- SELECTOR DE AÑO Y TORNEO --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <select 
          value={anio} 
          onChange={(e) => setAnio(Number(e.target.value))}
          style={{ padding: '8px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          <option value={2022}>Año 2022</option>
          <option value={2023}>Año 2023</option>
          <option value={2024}>Año 2024</option>
        </select>

        <select 
          value={torneo} 
          onChange={(e) => setTorneo(e.target.value)}
          style={{ padding: '8px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          <option value="apertura">Apertura</option>
          <option value="clausura">Clausura</option>
        </select>
      </div>

      {/* --- PESTAÑAS PRINCIPALES (FASE REGULAR VS CUADRANGULARES) --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        <button 
          onClick={() => setFase('fase-regular')}
          style={{ padding: '10px 20px', backgroundColor: fase === 'fase-regular' ? '#007bff' : '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Fase Regular (20 Fechas)
        </button>
        <button 
          onClick={() => setFase('cuadrangulares')}
          style={{ padding: '10px 20px', backgroundColor: fase === 'cuadrangulares' ? '#007bff' : '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cuadrangulares Finales
        </button>
      </div>

      {/* --- SUB-PESTAÑAS DE GRUPOS (Solo si está en Cuadrangulares) --- */}
      {fase === 'cuadrangulares' && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Selecciona el Grupo:</span>
          <button 
            onClick={() => setGrupo('A')}
            style={{ padding: '5px 15px', backgroundColor: grupo === 'A' ? '#28a745' : '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Grupo A
          </button>
          <button 
            onClick={() => setGrupo('B')}
            style={{ padding: '5px 15px', backgroundColor: grupo === 'B' ? '#28a745' : '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Grupo B
          </button>
        </div>
      )}

      {/* --- VISTA DE ESTADOS (CARGANDO / ERROR / TABLA) --- */}
      {cargando && <p style={{ color: '#ffc107' }}>⏳ Procesando estadísticas en Python...</p>}
      {error && <p style={{ color: '#dc3545' }}>⚠️ {error}</p>}

      {!cargando && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #444', color: '#aaa', backgroundColor: '#2a2a2a' }}>
              <th style={{ padding: '12px' }}>Pos</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PE</th>
              <th>PP</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {tabla.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No hay datos registrados para este torneo/fase en la base de datos aún.
                </td>
              </tr>
            ) : (
              tabla.map((item) => (
                <tr key={item.equipo} style={{ borderBottom: '1px solid #333', hover: { backgroundColor: '#252525' } }}>
                  <td style={{ padding: '12px' }}><b>{item.posicion}</b></td>
                  <td>{item.equipo}</td>
                  <td>{item.pj}</td>
                  <td>{item.pg}</td>
                  <td>{item.pe}</td>
                  <td>{item.pp}</td>
                  <td>{item.gf}</td>
                  <td>{item.gc}</td>
                  <td style={{ color: item.dg >= 0 ? '#28a745' : '#dc3545' }}>
                    {item.dg > 0 ? `+${item.dg}` : item.dg}
                  </td>
                  <td><b>{item.pts}</b></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}