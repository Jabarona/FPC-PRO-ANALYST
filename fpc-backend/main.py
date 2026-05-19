# main.py
import os
import pandas as pd
import unicodedata
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

def normalize_team_global(name):
    if not name:
        return ""
    return "".join(c for c in unicodedata.normalize('NFD', str(name)) if unicodedata.category(c) != 'Mn').lower().strip()

# Mapeo de logos para heredar logos reales cuando vengan vacíos/nulos (como en el año 2026)
LOGO_FALLBACKS = {
    "aguilas doradas": "https://media.api-sports.io/football/teams/1144.png",
    "alianza fc": "https://media.api-sports.io/football/teams/1141.png",
    "alianza valledupar": "https://media.api-sports.io/football/teams/1141.png",
    "america de cali": "https://media.api-sports.io/football/teams/1138.png",
    "america": "https://media.api-sports.io/football/teams/1138.png",
    "atletico nacional": "https://media.api-sports.io/football/teams/1137.png",
    "atl. nacional": "https://media.api-sports.io/football/teams/1137.png",
    "bucaramanga": "https://media.api-sports.io/football/teams/1131.png",
    "chico": "https://media.api-sports.io/football/teams/1132.png",
    "boyaca chico": "https://media.api-sports.io/football/teams/1132.png",
    "boyaca chico": "https://media.api-sports.io/football/teams/1132.png",
    "cucuta": "https://media.api-sports.io/football/teams/1470.png",
    "cucuta deportivo": "https://media.api-sports.io/football/teams/1470.png",
    "cúcuta": "https://media.api-sports.io/football/teams/1470.png",
    "cúcuta deportivo": "https://media.api-sports.io/football/teams/1470.png",
    "deportes tolima": "https://media.api-sports.io/football/teams/1142.png",
    "tolima": "https://media.api-sports.io/football/teams/1142.png",
    "deportivo cali": "https://media.api-sports.io/football/teams/1127.png",
    "dep. cali": "https://media.api-sports.io/football/teams/1127.png",
    "deportivo pasto": "https://media.api-sports.io/football/teams/1126.png",
    "dep. pasto": "https://media.api-sports.io/football/teams/1126.png",
    "deportivo pereira": "https://media.api-sports.io/football/teams/1462.png",
    "envigado": "https://media.api-sports.io/football/teams/1129.png",
    "fortaleza fc": "https://media.api-sports.io/football/teams/1147.png",
    "fortaleza": "https://media.api-sports.io/football/teams/1147.png",
    "huila": "https://media.api-sports.io/football/teams/1130.png",
    "independiente medellin": "https://media.api-sports.io/football/teams/1128.png",
    "ind. medellin": "https://media.api-sports.io/football/teams/1128.png",
    "ind. medellín": "https://media.api-sports.io/football/teams/1128.png",
    "inter palmira": "https://media.api-sports.io/football/teams/1146.png",
    "internacional de bogota": "https://media.api-sports.io/football/teams/1134.png",
    "inter de bogota": "https://media.api-sports.io/football/teams/1134.png",
    "inter de bogotá": "https://media.api-sports.io/football/teams/1134.png",
    "jaguares": "https://media.api-sports.io/football/teams/1133.png",
    "junior": "https://media.api-sports.io/football/teams/1135.png",
    "junior barranquilla": "https://media.api-sports.io/football/teams/1135.png",
    "llaneros": "https://media.api-sports.io/football/teams/1464.png",
    "millonarios": "https://media.api-sports.io/football/teams/1125.png",
    "once caldas": "https://media.api-sports.io/football/teams/1136.png",
    "patriotas": "https://media.api-sports.io/football/teams/1140.png",
    "santa fe": "https://media.api-sports.io/football/teams/1139.png",
    "union magdalena": "https://media.api-sports.io/football/teams/1465.png"
}

def get_db_dataframe():
    """Se conecta a PostgreSQL y trae la vista con los datos unificados y limpios, heredando logos si están vacíos."""
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(connection_string)
    
    df = pd.read_sql_query("SELECT * FROM v_fpc_matches;", engine)
    
    # Rellenar los logos vacíos usando el mapeo de fallbacks
    def get_fallback_logo(team_name, current_logo):
        if current_logo and pd.notna(current_logo) and str(current_logo).strip() != "" and str(current_logo) != "None":
            return current_logo
        normalized = normalize_team_global(team_name)
        return LOGO_FALLBACKS.get(normalized, current_logo)
        
    df['logo_local'] = df.apply(lambda row: get_fallback_logo(row['equipo_local'], row['logo_local']), axis=1)
    df['logo_visitante'] = df.apply(lambda row: get_fallback_logo(row['equipo_visitante'], row['logo_visitante']), axis=1)
    
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
    """Retorna la lista de los 20 equipos activos en la temporada 2026 con sus logos."""
    df = get_db_dataframe()
    # Filtrar estrictamente por la temporada 2026 para mostrar solo los equipos vigentes
    df_2026 = df[df['season'] == 2026].copy()
    
    # Extraer equipos locales y visitantes con sus logos
    locales = df_2026[['equipo_local', 'logo_local']].rename(columns={'equipo_local': 'nombre', 'logo_local': 'logo'})
    visitantes = df_2026[['equipo_visitante', 'logo_visitante']].rename(columns={'equipo_visitante': 'nombre', 'logo_visitante': 'logo'})
    
    todos = pd.concat([locales, visitantes]).drop_duplicates(subset=['nombre']).dropna(subset=['nombre'])
    equipos_list = todos.sort_values(by='nombre').to_dict(orient='records')
    
    return {"equipos": equipos_list}

TEAM_ALIASES_MAP = {
    "America de Cali": ["América", "America de Cali"],
    "América": ["América", "America de Cali"],
    "Atlético Nacional": ["Atl. Nacional", "Atletico Nacional"],
    "Atletico Nacional": ["Atl. Nacional", "Atletico Nacional"],
    "Atl. Nacional": ["Atl. Nacional", "Atletico Nacional"],
    "Deportivo Cali": ["Dep. Cali", "Deportivo Cali"],
    "Dep. Cali": ["Dep. Cali", "Deportivo Cali"],
    "Deportes Tolima": ["Tolima", "Deportes Tolima"],
    "Tolima": ["Tolima", "Deportes Tolima"],
    "Deportivo Pasto": ["Dep. Pasto", "Deportivo Pasto"],
    "Dep. Pasto": ["Dep. Pasto", "Deportivo Pasto"],
    "Independiente Medellin": ["Ind. Medellín", "Independiente Medellin"],
    "Ind. Medellín": ["Ind. Medellín", "Independiente Medellin"],
    "Junior": ["Junior Barranquilla", "Junior"],
    "Junior Barranquilla": ["Junior Barranquilla", "Junior"],
    "Boyacá Chicó": ["Boyacá Chicó", "Chico"],
    "Chico": ["Boyacá Chicó", "Chico"],
    "Fortaleza": ["Fortaleza", "Fortaleza FC"],
    "Fortaleza FC": ["Fortaleza", "Fortaleza FC"],
    "Alianza Valledupar": ["Alianza Valledupar", "Alianza FC"],
    "Alianza FC": ["Alianza Valledupar", "Alianza FC"],
    "Inter de Bogotá": ["Inter de Bogotá", "Internacional de Bogota"],
    "Internacional de Bogota": ["Inter de Bogotá", "Internacional de Bogota"]
}

@app.get("/api/v1/equipos/{equipo}/stats")
def get_team_stats(equipo: str):
    """Retorna estadísticas avanzadas y estado de forma de un equipo específico."""
    df = get_db_dataframe()
    
    # Obtener aliases del equipo para buscar en todas las temporadas
    aliases = TEAM_ALIASES_MAP.get(equipo, [equipo])
    
    # Filtrar partidos donde participó el equipo (usando cualquier alias)
    df_team = df[(df['equipo_local'].isin(aliases)) | (df['equipo_visitante'].isin(aliases))].copy()
    
    if df_team.empty:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    # Filtrar solo los partidos que ya se han jugado (goles no nulos)
    df_team['goles_local_num'] = pd.to_numeric(df_team['goles_local'], errors='coerce')
    df_team['goles_visitante_num'] = pd.to_numeric(df_team['goles_visitante'], errors='coerce')
    df_played = df_team.dropna(subset=['goles_local_num', 'goles_visitante_num']).copy()
    
    # Ordenar por temporada y match_id descendente (más reciente primero)
    df_played = df_played.sort_values(by=['season', 'match_id'], ascending=[False, False])
    
    # Estado de forma (últimos 5 partidos jugados)
    form = []
    recent_matches = []
    for _, row in df_played.head(5).iterrows():
        is_home = row['equipo_local'] in aliases
        opponent = row['equipo_visitante'] if is_home else row['equipo_local']
        opponent_logo = row.get('logo_visitante', '') if is_home else row.get('logo_local', '')
        g_local, g_visitante = int(row['goles_local_num']), int(row['goles_visitante_num'])
        
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
            "opponent_logo": opponent_logo,
            "result": f"{g_local} - {g_visitante}",
            "label": label,
            "status": "Final",
            "season": int(row['season'])
        })

    # Obtener el logo del equipo (preferir el alias de 2026)
    logo_equipo = ""
    df_2026_home = df_team[(df_team['season'] == 2026) & (df_team['equipo_local'].isin(aliases))]
    df_2026_away = df_team[(df_team['season'] == 2026) & (df_team['equipo_visitante'].isin(aliases))]
    if not df_2026_home.empty:
        logo_equipo = df_2026_home.iloc[0].get('logo_local', '')
    elif not df_2026_away.empty:
        logo_equipo = df_2026_away.iloc[0].get('logo_visitante', '')
    
    if not logo_equipo:
        # Fallback a cualquier temporada
        df_as_home = df_team[df_team['equipo_local'].isin(aliases)]
        if not df_as_home.empty:
            logo_equipo = df_as_home.iloc[0].get('logo_local', '')

    # Obtener estadio y ciudad reales desde matches_raw
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine_local = create_engine(connection_string)
    
    df_home = df_played[df_played['equipo_local'].isin(aliases)]
    estadio_real = "Desconocido"
    ciudad_real = "Desconocida"
    if not df_home.empty:
        last_match_id = int(df_home.iloc[0]['match_id'])
        stadium_query = "SELECT data_raw->'fixture'->'venue'->>'name' as stadium, data_raw->'fixture'->'venue'->>'city' as city FROM matches_raw WHERE match_id = %s LIMIT 1;"
        df_venue = pd.read_sql_query(stadium_query, engine_local, params=(last_match_id,))
        if not df_venue.empty:
            estadio_real = df_venue.iloc[0]['stadium'] if pd.notna(df_venue.iloc[0]['stadium']) else "Desconocido"
            ciudad_real = df_venue.iloc[0]['city'] if pd.notna(df_venue.iloc[0]['city']) else "Desconocida"

    # ====== CALCULAR POSICIÓN REAL EN LA TABLA 2026 APERTURA ======
    valid_rounds_2026 = [f"Apertura - {i}" for i in range(1, 21)]
    tabla_2026 = build_table_stats(df, 2026, valid_rounds_2026)
    posicion_actual = 0
    pts_actuales = 0
    pj_total = 0
    for entry in tabla_2026:
        if entry['equipo'] in aliases:
            posicion_actual = entry['posicion']
            pts_actuales = entry['pts']
            pj_total = entry['pj']
            break

    # ====== ESTADÍSTICAS REALES DE RENDIMIENTO 2026 APERTURA ======
    df_2026 = df_played[(df_played['season'] == 2026) & ((df_played['equipo_local'].isin(aliases)) | (df_played['equipo_visitante'].isin(aliases)))].copy()
    wins_2026 = 0
    draws_2026 = 0
    losses_2026 = 0
    gf_2026 = 0
    gc_2026 = 0
    for _, row in df_2026.iterrows():
        is_home = row['equipo_local'] in aliases
        g_local, g_away = int(row['goles_local_num']), int(row['goles_visitante_num'])
        gf_2026 += g_local if is_home else g_away
        gc_2026 += g_away if is_home else g_local
        if g_local == g_away:
            draws_2026 += 1
        elif (is_home and g_local > g_away) or (not is_home and g_away > g_local):
            wins_2026 += 1
        else:
            losses_2026 += 1
    
    total_2026 = wins_2026 + draws_2026 + losses_2026
    win_pct = round((wins_2026 / total_2026 * 100), 1) if total_2026 > 0 else 0
    draw_pct = round((draws_2026 / total_2026 * 100), 1) if total_2026 > 0 else 0
    loss_pct = round((losses_2026 / total_2026 * 100), 1) if total_2026 > 0 else 0
    gf_avg = round(gf_2026 / total_2026, 1) if total_2026 > 0 else 0
    gc_avg = round(gc_2026 / total_2026, 1) if total_2026 > 0 else 0

    # ====== RENDIMIENTO HISTÓRICO 2022-2026 ======
    historical_positions = {}
    for year in [2022, 2023, 2024, 2025, 2026]:
        for torneo_name in ["Apertura", "Clausura"]:
            rounds = [f"{torneo_name} - {i}" for i in range(1, 21)]
            tabla = build_table_stats(df, year, rounds)
            for entry in tabla:
                if entry['equipo'] in aliases:
                    key = f"{year} {torneo_name}"
                    historical_positions[key] = {
                        "posicion": entry['posicion'],
                        "pts": entry['pts'],
                        "pj": entry['pj'],
                        "pg": entry['pg'],
                        "dg": entry['dg']
                    }
                    break
    
    # Promediar posiciones históricas para calcular rendimiento global
    if historical_positions:
        all_pos = [v['posicion'] for v in historical_positions.values()]
        avg_position = round(sum(all_pos) / len(all_pos), 1)
        best_position = min(all_pos)
        worst_position = max(all_pos)
        top4_count = sum(1 for p in all_pos if p <= 4)
        top8_count = sum(1 for p in all_pos if p <= 8)
        total_torneos = len(all_pos)
        top4_pct = round(top4_count / total_torneos * 100, 1) if total_torneos > 0 else 0
        top8_pct = round(top8_count / total_torneos * 100, 1) if total_torneos > 0 else 0
    else:
        avg_position = 0
        best_position = 0
        worst_position = 0
        top4_pct = 0
        top8_pct = 0

    stats = {
        "ciudad": ciudad_real,
        "estadio": estadio_real,
        "posicion_actual": posicion_actual,
        "pts_actuales": pts_actuales,
        "pj_total": pj_total,
        # Rendimiento 2026
        "wins": wins_2026,
        "draws": draws_2026,
        "losses": losses_2026,
        "win_pct": win_pct,
        "draw_pct": draw_pct,
        "loss_pct": loss_pct,
        "goles_favor": gf_2026,
        "goles_contra": gc_2026,
        "gf_avg": gf_avg,
        "gc_avg": gc_avg,
        "dg": gf_2026 - gc_2026,
        # Rendimiento histórico
        "avg_position": avg_position,
        "best_position": best_position,
        "worst_position": worst_position,
        "top4_pct": top4_pct,
        "top8_pct": top8_pct,
        "historical": historical_positions
    }

    return {
        "equipo": equipo,
        "logo": logo_equipo,
        "form": form[::-1],
        "recent_matches": recent_matches,
        "stats": stats
    }

@app.get("/api/v1/tabla/fases-eliminatorias/{anio}/{torneo}/{fase}")
def get_fases_eliminatorias(anio: int, torneo: str, fase: str):
    """
    Retorna los emparejamientos y resultados de fases eliminatorias (Cuartos, Semifinal, Final).
    Ejemplo: /api/v1/tabla/fases-eliminatorias/2026/apertura/cuartos
    """
    torneo_cap = torneo.strip().capitalize()
    fase_lower = fase.strip().lower()
    
    if torneo_cap not in ['Apertura', 'Clausura'] or fase_lower not in ['cuartos', 'semifinal', 'final']:
        raise HTTPException(status_code=400, detail="Parámetros inválidos. Ejemplo: /2026/apertura/cuartos")
        
    df = get_db_dataframe()
    df_year = df[df['season'] == anio].copy()
    
    # Determinar el filtro de jornada
    if fase_lower == 'cuartos':
        round_filter = 'Cuartos'
    elif fase_lower == 'semifinal':
        round_filter = 'Semifinal'
    else:
        round_filter = 'Final'
        
    # Filtrar partidos de la fase seleccionada
    # Para 'final', queremos que coincida con 'Final' pero NO con 'Semifinal' o 'Cuartos'
    if fase_lower == 'final':
        df_filtered = df_year[
            df_year['jornada'].str.contains('Final', case=False, na=False) & 
            ~df_year['jornada'].str.contains('Semifinal', case=False, na=False) &
            ~df_year['jornada'].str.contains('Cuartos', case=False, na=False)
        ].copy()
    else:
        df_filtered = df_year[df_year['jornada'].str.contains(round_filter, case=False, na=False)].copy()
        
    if df_filtered.empty:
        return {"anio": anio, "torneo": torneo, "fase": fase, "parejas": []}
        
    # Agrupar por enfrentamientos
    # Cada enfrentamiento consta de Ida y Vuelta entre los mismos dos equipos
    pairings = {}
    
    for _, row in df_filtered.iterrows():
        team_a = row['equipo_local']
        team_b = row['equipo_visitante']
        logo_a = row['logo_local']
        logo_b = row['logo_visitante']
        
        # Clave única para el emparejamiento (alfabética)
        pairing_key = tuple(sorted([team_a, team_b]))
        
        if pairing_key not in pairings:
            pairings[pairing_key] = {
                "equipo_1": pairing_key[0],
                "logo_1": logo_a if pairing_key[0] == team_a else logo_b,
                "equipo_2": pairing_key[1],
                "logo_2": logo_b if pairing_key[0] == team_a else logo_a,
                "ida": None,
                "vuelta": None,
                "global_1": 0,
                "global_2": 0,
                "ganador": None
            }
            
        p = pairings[pairing_key]
        
        # Determinar si es partido de Ida o Vuelta
        jornada = row['jornada'].lower()
        match_info = {
            "local": team_a,
            "logo_local": logo_a,
            "visitante": team_b,
            "logo_visitante": logo_b,
            "goles_local": int(row['goles_local']) if pd.notna(row['goles_local']) else None,
            "goles_visitante": int(row['goles_visitante']) if pd.notna(row['goles_visitante']) else None
        }
        
        if 'ida' in jornada:
            p['ida'] = match_info
        elif 'vuelta' in jornada:
            p['vuelta'] = match_info
            
    # Calcular marcadores globales y definir ganadores
    for p in pairings.values():
        g1 = 0
        g2 = 0
        played_any = False
        
        # Sumar goles para el equipo 1 y 2
        for leg in ['ida', 'vuelta']:
            leg_data = p[leg]
            if leg_data and leg_data['goles_local'] is not None and leg_data['goles_visitante'] is not None:
                played_any = True
                # Si el local de este partido es equipo_1
                if leg_data['local'] == p['equipo_1']:
                    g1 += leg_data['goles_local']
                    g2 += leg_data['goles_visitante']
                else:
                    g2 += leg_data['goles_local']
                    g1 += leg_data['goles_visitante']
                    
        if played_any:
            p['global_1'] = g1
            p['global_2'] = g2
            
            # Si se ha completado la vuelta (o ya hay marcador final global)
            if p['vuelta'] and p['vuelta']['goles_local'] is not None:
                if g1 > g2:
                    p['ganador'] = p['equipo_1']
                elif g2 > g1:
                    p['ganador'] = p['equipo_2']
                else:
                    p['ganador'] = "Empate"
        else:
            p['global_1'] = None
            p['global_2'] = None
            
    return {
        "anio": anio,
        "torneo": torneo,
        "fase": fase,
        "parejas": list(pairings.values())
    }

