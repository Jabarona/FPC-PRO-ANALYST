# analytics.py
import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

def load_data_from_db():
    """Trae la data desde la vista de Postgres, limpia de duplicados."""
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(connection_string)
    
    query = "SELECT * FROM v_fpc_matches;"
    df = pd.read_sql_query(query, engine)
    df = df.drop_duplicates(subset=['match_id']).copy()
    return df

def calculate_stats_by_filter(df, season, valid_rounds):
    """Calcula la tabla completa (PJ, G, E, P, GF, GC, DG, PTS) usando una Lista Blanca."""
    df_year = df[df['season'] == season].copy()
    
    # EL FILTRO INFALIBLE: Solo procesamos si la jornada está exactamente en la lista blanca
    df_filtered = df_year[df_year['jornada'].isin(valid_rounds)].copy()
    
    stats = {}
    
    for _, row in df_filtered.iterrows():
        home = row['equipo_local']
        away = row['equipo_visitante']
        g_home = int(row['goles_local'])
        g_away = int(row['goles_visitante'])
        
        # Inicializar diccionario para equipos nuevos
        if home not in stats: stats[home] = {'pj':0, 'pg':0, 'pe':0, 'pp':0, 'gf':0, 'gc':0, 'pts':0}
        if away not in stats: stats[away] = {'pj':0, 'pg':0, 'pe':0, 'pp':0, 'gf':0, 'gc':0, 'pts':0}
        
        # Sumar Partidos Jugados y Goles
        stats[home]['pj'] += 1
        stats[away]['pj'] += 1
        stats[home]['gf'] += g_home
        stats[away]['gf'] += g_away
        stats[home]['gc'] += g_away
        stats[away]['gc'] += g_home
        
        # Sumar Victorias, Empates, Derrotas y Puntos
        if g_home > g_away:
            stats[home]['pg'] += 1
            stats[home]['pts'] += 3
            stats[away]['pp'] += 1
        elif g_away > g_home:
            stats[away]['pg'] += 1
            stats[away]['pts'] += 3
            stats[home]['pp'] += 1
        else:
            stats[home]['pe'] += 1
            stats[home]['pts'] += 1
            stats[away]['pe'] += 1
            stats[away]['pts'] += 1
            
    if not stats:
        return pd.DataFrame()
        
    # Convertir a DataFrame
    df_res = pd.DataFrame.from_dict(stats, orient='index').reset_index()
    df_res = df_res.rename(columns={'index': 'equipo'})
    
    # Calcular Diferencia de Gol
    df_res['dg'] = df_res['gf'] - df_res['gc']
    
    # Ordenar como dicta el reglamento: Puntos > Diferencia de Gol > Goles a Favor
    df_res = df_res.sort_values(by=['pts', 'dg', 'gf'], ascending=[False, False, False]).reset_index(drop=True)
    
    df_res.index = df_res.index + 1
    df_res.index.name = 'pos'
    
    # Retornar las columnas en el orden oficial
    return df_res[['equipo', 'pj', 'pg', 'pe', 'pp', 'gf', 'gc', 'dg', 'pts']]

if __name__ == "__main__":
    print("[Python] Calculando tabla oficial con filtro estricto (Lista Blanca)...")
    df_partidos = load_data_from_db()
    
    AÑO_ANALISIS = 2022
    
    # LISTA BLANCA MÁGICA: Genera una lista exacta ['Apertura - 1', 'Apertura - 2', ... 'Apertura - 20']
    rondas_validas_apertura = [f"Apertura - {i}" for i in range(1, 21)]
    
    # Calculamos la tabla pasando únicamente esas 20 jornadas válidas
    tabla_apertura = calculate_stats_by_filter(df_partidos, AÑO_ANALISIS, rondas_validas_apertura)
    
    print(f"\n=========================================================================")
    print(f"      TABLA APERTURA {AÑO_ANALISIS} FASE REGULAR (AUDITORÍA FINAL)")
    print(f"=========================================================================")
    print(tabla_apertura.to_string())