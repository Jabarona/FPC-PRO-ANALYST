# main.py
import os
import pandas as pd
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from dotenv import load_dotenv

from auth import (
    User,
    UserRead,
    UserCreate,
    UserUpdate,
    auth_backend,
    fastapi_users,
    current_active_user,
    create_db_and_tables
)

load_dotenv()

app = FastAPI(
    title="FPC Stats API", 
    description="API Backend para alimentar las pestañas de tablas de posiciones del FPC en React"
)

@app.on_event("startup")
async def on_startup():
    # Crea automáticamente las tablas de usuarios en Postgres si no existen
    await create_db_and_tables()

# --- RUTAS AUTOMÁTICAS DE FASTAPI USERS ---
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# --- EJEMPLO DE RUTA PROTEGIDA (CASO DE USO) ---
@app.get("/api/v1/analisis/dashboard", tags=["analisis"])
async def get_analisis_dashboard(user: User = Depends(current_active_user)):
    """
    Ruta protegida: Solo accesible si el usuario envía un token JWT válido.
    FastAPI Users se encarga de validar el token e inyectar el usuario logueado en 'user'.
    Si no hay token, rechaza con Error 401 automáticamente.
    """
    return {
        "message": f"¡Bienvenido al análisis avanzado, {user.email}!",
        "equipo_favorito": user.equipo_favorito,
        "analisis_premium": {
            "rendimiento_general": "Alto",
            "probabilidad_campeonato": "75%" if user.equipo_favorito else "No definido"
        }
    }

# CONFIGURACIÓN DE CORS: Permite que tu app de React se conecte sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_dataframe():
    """Se conecta a PostgreSQL y trae la vista con los datos unificados y limpios."""
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(connection_string)
    
    df = pd.read_sql_query("SELECT * FROM v_fpc_matches;", engine)
    return df.drop_duplicates(subset=['match_id']).copy()

def build_table_stats(df, season, valid_rounds):
    """Procesa los partidos de las rondas seleccionadas y calcula la tabla estadística."""
    df_year = df[df['season'] == season].copy()
    df_filtered = df_year[df_year['jornada'].isin(valid_rounds)].copy()
    
    if df_filtered.empty:
        return []
        
    stats = {}
    for _, row in df_filtered.iterrows():
        home, away = row['equipo_local'], row['equipo_visitante']
        logo_home, logo_away = row.get('logo_local', ''), row.get('logo_visitante', '')
        g_home, g_away = int(row['goles_local']), int(row['goles_visitante'])
        
        if home not in stats: stats[home] = {'pj':0, 'pg':0, 'pe':0, 'pp':0, 'gf':0, 'gc':0, 'pts':0, 'logo': logo_home}
        if away not in stats: stats[away] = {'pj':0, 'pg':0, 'pe':0, 'pp':0, 'gf':0, 'gc':0, 'pts':0, 'logo': logo_away}
        
        stats[home]['pj'] += 1
        stats[away]['pj'] += 1
        stats[home]['gf'] += g_home
        stats[away]['gf'] += g_away
        stats[home]['gc'] += g_away
        stats[away]['gc'] += g_home
        
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

    df_res = pd.DataFrame.from_dict(stats, orient='index').reset_index().rename(columns={'index': 'equipo'})
    df_res['dg'] = df_res['gf'] - df_res['gc']
    
    # Ordenación oficial: Puntos -> Diferencia de Gol -> Goles a Favor
    df_res = df_res.sort_values(by=['pts', 'dg', 'gf'], ascending=[False, False, False]).reset_index(drop=True)
    df_res.index = df_res.index + 1
    df_res['posicion'] = df_res.index
    
    return df_res.to_dict(orient="records")


# =========================================================================
#                            ENDPOINTS DE LA API
# =========================================================================

@app.get("/api/v1/tabla/fase-regular/{anio}/{torneo}")
def get_fase_regular(anio: int, torneo: str):
    """
    Pestañas: Apertura o Clausura (Fase Regular de 20 Fechas)
    Ejemplo: /api/v1/tabla/fase-regular/2022/apertura
    """
    torneo_capitalizado = torneo.strip().capitalize() # 'Apertura' o 'Clausura'
    if torneo_capitalizado not in ['Apertura', 'Clausura']:
        raise HTTPException(status_code=400, detail="Torneo inválido. Use 'apertura' o 'clausura'")
        
    df = get_db_dataframe()
    # Whitelist estricta de las 20 fechas
    valid_rounds = [f"{torneo_capitalizado} - {i}" for i in range(1, 21)]
    
    data_tabla = build_table_stats(df, anio, valid_rounds)
    return {"anio": anio, "torneo": torneo, "fase": "Fase Regular", "tabla": data_tabla}


HISTORICAL_GROUPS = {
    (2022, "Apertura"): {
        "A": ["Millonarios", "Atletico Nacional", "Junior", "Bucaramanga"],
        "B": ["Deportes Tolima", "Independiente Medellin", "La Equidad", "Envigado"]
    },
    (2022, "Clausura"): {
        "A": ["Santa Fe", "Millonarios", "Deportivo Pereira", "Junior"],
        "B": ["Aguilas Doradas", "Independiente Medellin", "Deportivo Pasto", "America de Cali"]
    },
    (2024, "Apertura"): {
        "A": ["Bucaramanga", "Deportivo Pereira", "Millonarios", "Junior"],
        "B": ["Deportes Tolima", "Santa Fe", "Once Caldas", "La Equidad"]
    },
    (2026, "Apertura"): {
        "A": ["Atletico Nacional", "Millonarios", "Bucaramanga", "Junior"],
        "B": ["America de Cali", "Santa Fe", "Deportivo Cali", "Aguilas Doradas"]
    }
}

@app.get("/api/v1/tabla/cuadrangulares/{anio}/{torneo}/{grupo}")
def get_cuadrangulares(anio: int, torneo: str, grupo: str):
    """
    Retorna la tabla de cuadrangulares del Grupo A o B de forma dinámica o basándose en registros históricos.
    """
    torneo_cap = torneo.strip().capitalize()
    grupo_cap = grupo.strip().upper() # 'A' o 'B'
    
    if torneo_cap not in ['Apertura', 'Clausura'] or grupo_cap not in ['A', 'B']:
        raise HTTPException(status_code=400, detail="Parámetros inválidos. Ejemplo: /2022/apertura/A")
        
    df = get_db_dataframe()
    df_year = df[df['season'] == anio].copy()
    
    # Filtrar solo partidos de cuadrangulares
    df_filtered = df_year[df_year['jornada'].str.startswith(f"{torneo_cap} - Quadrangular -", na=False)].copy()
    
    if df_filtered.empty:
        return {"anio": anio, "torneo": torneo, "fase": f"Cuadrangular Grupo {grupo_cap}", "tabla": []}

    target_teams = []
    
    # 1. Intentar usar mapeo histórico oficial si existe
    if (anio, torneo_cap) in HISTORICAL_GROUPS:
        target_teams = HISTORICAL_GROUPS[(anio, torneo_cap)].get(grupo_cap, [])
    else:
        # 2. De lo contrario, ejecutar algoritmo dinámico de particionado de componentes conexas (Grafos)
        adj = {}
        for _, row in df_filtered.iterrows():
            u, v = row['equipo_local'], row['equipo_visitante']
            if u not in adj: adj[u] = set()
            if v not in adj: adj[v] = set()
            adj[u].add(v)
            adj[v].add(u)
        
        components = []
        visited = set()
        for node in adj:
            if node not in visited:
                comp = []
                q = [node]
                visited.add(node)
                while q:
                    curr = q.pop(0)
                    comp.append(curr)
                    for neighbor in adj[curr]:
                        if neighbor not in visited:
                            visited.add(neighbor)
                            q.append(neighbor)
                components.append(sorted(comp))
        
        # Ordenamos las componentes por orden alfabético del primer equipo para consistencia
        components = sorted(components, key=lambda x: x[0] if x else "")
        
        if len(components) >= 2:
            groups = {"A": components[0], "B": components[1]}
            target_teams = groups.get(grupo_cap, [])
        elif len(components) == 1:
            # Si solo se ha jugado un grupo, asumirlo como el A
            groups = {"A": components[0], "B": []}
            target_teams = groups.get(grupo_cap, [])
        else:
            # Fallback
            all_teams = sorted(list(set(df_filtered['equipo_local'].unique()) | set(df_filtered['equipo_visitante'].unique())))
            if len(all_teams) >= 8:
                groups = {"A": all_teams[:4], "B": all_teams[4:]}
                target_teams = groups.get(grupo_cap, [])

    import unicodedata
    def normalize_team(name):
        if not name:
            return ""
        return "".join(c for c in unicodedata.normalize('NFD', str(name)) if unicodedata.category(c) != 'Mn').lower().strip()
        
    target_teams_norm = {normalize_team(t) for t in target_teams}
    df_group = df_filtered[
        df_filtered.apply(lambda row: normalize_team(row['equipo_local']) in target_teams_norm and normalize_team(row['equipo_visitante']) in target_teams_norm, axis=1)
    ]
    tabla_ordenada = build_table_stats(df_group, anio, df_group['jornada'].unique().tolist())
           
    return {"anio": anio, "torneo": torneo, "fase": f"Cuadrangular Grupo {grupo_cap}", "tabla": tabla_ordenada}

@app.get("/api/v1/equipos")
def get_equipos():
    """Retorna la lista de todos los equipos únicos en la base de datos con sus logos."""
    df = get_db_dataframe()
    # Extraer equipos locales y visitantes con sus logos
    locales = df[['equipo_local', 'logo_local']].rename(columns={'equipo_local': 'nombre', 'logo_local': 'logo'})
    visitantes = df[['equipo_visitante', 'logo_visitante']].rename(columns={'equipo_visitante': 'nombre', 'logo_visitante': 'logo'})
    
    todos = pd.concat([locales, visitantes]).drop_duplicates(subset=['nombre']).dropna(subset=['nombre'])
    equipos_list = todos.sort_values(by='nombre').to_dict(orient='records')
    
    return {"equipos": equipos_list}

@app.get("/api/v1/equipos/{equipo}/stats")
def get_team_stats(equipo: str):
    """Retorna estadísticas avanzadas y estado de forma de un equipo específico."""
    df = get_db_dataframe()
    
    # Filtrar partidos donde participó el equipo
    df_team = df[(df['equipo_local'] == equipo) | (df['equipo_visitante'] == equipo)].copy()
    
    if df_team.empty:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    # Ordenar por fecha (asumiendo que hay una columna de fecha o podemos usar jornada/season como proxy)
    # Por ahora usaremos los últimos partidos encontrados
    df_team = df_team.sort_values(by=['season', 'match_id'], ascending=[False, False])
    
    # Estado de forma (últimos 5 partidos)
    form = []
    recent_matches = []
    for _, row in df_team.head(5).iterrows():
        is_home = row['equipo_local'] == equipo
        opponent = row['equipo_visitante'] if is_home else row['equipo_local']
        g_local, g_visitante = int(row['goles_local']), int(row['goles_visitante'])
        
        res = ""
        if g_local == g_visitante:
            res = "D"
            label = "EMPATE"
        elif (is_home and g_local > g_visitante) or (not is_home and g_visitante > g_local):
            res = "W"
            label = f"VICTORIA {'LOCAL' if is_home else 'VISITANTE'}"
        else:
            res = "L"
            label = f"DERROTA {'LOCAL' if is_home else 'VISITANTE'}"
            
        form.append(res)
        recent_matches.append({
            "opponent": opponent,
            "result": f"{g_local} - {g_visitante}",
            "label": label,
            "status": "Final"
        })

    # Estadísticas tácticas (Simuladas basándose en promedios o datos que tengamos)
    # En un escenario real, estas vendrían de columnas de xG, posesión, etc.
    # Como el DF actual es básico, generaremos algunas coherentes
    
    # Obtener estadio y ciudad reales desde la base de datos (matches_raw)
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine_local = create_engine(connection_string)
    
    stadium_query = "SELECT data_raw->'fixture'->'venue'->>'name' as stadium, data_raw->'fixture'->'venue'->>'city' as city FROM matches_raw WHERE data_raw->'teams'->'home'->>'name' = %s LIMIT 1;"
    df_venue = pd.read_sql_query(stadium_query, engine_local, params=(equipo,))
    
    estadio_real = df_venue.iloc[0]['stadium'] if not df_venue.empty and pd.notna(df_venue.iloc[0]['stadium']) else "Desconocido"
    ciudad_real = df_venue.iloc[0]['city'] if not df_venue.empty and pd.notna(df_venue.iloc[0]['city']) else "Desconocida"

    stats = {
        "posesion": 52,
        "pases": 78,
        "efectividad": 35,
        "duelos": 58,
        "remates_promedio": 12.8,
        "faltas_recibidas": 11.4,
        "posicion_actual": 4, # Esto debería calcularse de la tabla más reciente
        "titulos": 10,
        "ciudad": ciudad_real,
        "estadio": estadio_real
    }

    return {
        "equipo": equipo,
        "form": form[::-1], # Invertir para que el más reciente esté al final a la derecha
        "recent_matches": recent_matches,
        "stats": stats
    }
