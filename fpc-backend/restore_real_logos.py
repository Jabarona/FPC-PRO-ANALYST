"""
SCRIPT DE RESTAURACIÓN DEFINITIVA DE LA BASE DE DATOS.
Usa los logos REALES obtenidos directamente de api-sports.io (Liga 239).

Los IDs correctos de api-sports son:
  1125 = Millonarios
  1126 = Deportivo Pasto
  1127 = Deportivo Cali
  1128 = Independiente Medellin
  1129 = Envigado
  1131 = Bucaramanga
  1132 = Chico (Boyacá Chicó)
  1133 = Jaguares
  1134 = Internacional de Bogota
  1135 = Junior
  1136 = Once Caldas
  1137 = Atletico Nacional
  1138 = America de Cali
  1139 = Santa Fe
  1140 = Patriotas
  1141 = Alianza Valledupar
  1142 = Deportes Tolima
  1144 = Águilas Doradas
  1147 = Fortaleza FC
  1462 = Deportivo Pereira
  1465 = Union Magdalena (no en 2024 but exists in DB)
  1123 = Llaneros (not in 2024 but exists in DB)
  1146 = Inter Palmira (not in 2024 but exists in DB)
"""
import json
import pandas as pd
from sqlalchemy import create_engine, text
import os
import unicodedata

db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'postgres')
db_host = os.environ.get('DB_HOST', 'db')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME', 'fpc_db')

engine = create_engine(f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')

def normalize(name):
    if not name:
        return ''
    return ''.join(c for c in unicodedata.normalize('NFD', str(name)) if unicodedata.category(c) != 'Mn').lower().strip()

# Mapeo: nombre normalizado -> ID real de api-sports
# Estos son los IDs REALES verificados contra la API de api-sports.io
REAL_API_SPORTS_IDS = {
    'millonarios': 1125,
    'deportivo pasto': 1126,
    'dep. pasto': 1126,
    'pasto': 1126,
    'deportivo cali': 1127,
    'dep. cali': 1127,
    'cali': 1127,
    'independiente medellin': 1128,
    'ind. medellin': 1128,
    'medellin': 1128,
    'envigado': 1129,
    'bucaramanga': 1131,
    'chico': 1132,
    'boyaca chico': 1132,
    'jaguares': 1133,
    'internacional de bogota': 1134,
    'inter de bogota': 1134,
    'junior': 1135,
    'junior barranquilla': 1135,
    'once caldas': 1136,
    'atletico nacional': 1137,
    'atl. nacional': 1137,
    'nacional': 1137,
    'america de cali': 1138,
    'america': 1138,
    'santa fe': 1139,
    'patriotas': 1140,
    'alianza valledupar': 1141,
    'alianza fc': 1141,
    'alianza': 1141,
    'deportes tolima': 1142,
    'tolima': 1142,
    'aguilas doradas': 1144,
    'fortaleza': 1147,
    'fortaleza fc': 1147,
    'fortaleza ceif': 1147,
    'deportivo pereira': 1462,
    'pereira': 1462,
    'union magdalena': 1465,
    'llaneros': 1123,
    'inter palmira': 1146,
    'huila': 1130,
    'cucuta': 1145,
    'cucuta deportivo': 1145,
    'la equidad': 1124,
}

def get_real_logo(team_name):
    """Obtiene la URL del logo real de api-sports para un equipo."""
    n = normalize(team_name)
    team_id = REAL_API_SPORTS_IDS.get(n)
    if team_id:
        return f"https://media.api-sports.io/football/teams/{team_id}.png"
    return None

try:
    print("1. Cargando TODOS los partidos de matches_raw...")
    df_all = pd.read_sql_query("SELECT match_id, data_raw FROM matches_raw;", engine)
    print(f"   Total de partidos: {len(df_all)}")
    
    updated = 0
    skipped = 0
    
    for idx, row in df_all.iterrows():
        match_id = row['match_id']
        data = row['data_raw']
        if not data:
            continue
            
        home = data.get('teams', {}).get('home', {})
        away = data.get('teams', {}).get('away', {})
        
        home_name = home.get('name', '')
        away_name = away.get('name', '')
        
        real_home_logo = get_real_logo(home_name)
        real_away_logo = get_real_logo(away_name)
        
        modified = False
        
        if real_home_logo and home.get('logo') != real_home_logo:
            home['logo'] = real_home_logo
            modified = True
            
        if real_away_logo and away.get('logo') != real_away_logo:
            away['logo'] = real_away_logo
            modified = True
        
        if modified:
            with engine.connect() as conn:
                conn.execute(
                    text("UPDATE matches_raw SET data_raw = :json_data WHERE match_id = :mid"),
                    {"json_data": json.dumps(data), "mid": match_id}
                )
                conn.commit()
            updated += 1
        else:
            skipped += 1

    print(f"\n✅ RESTAURACIÓN COMPLETA:")
    print(f"   Partidos corregidos: {updated}")
    print(f"   Partidos sin cambios: {skipped}")
    
    # Verificación final
    print("\n--- VERIFICACIÓN FINAL ---")
    df_check = pd.read_sql_query("SELECT match_id, data_raw FROM matches_raw WHERE season = 2024 LIMIT 5;", engine)
    for _, row in df_check.iterrows():
        d = row['data_raw']
        h = d.get('teams',{}).get('home',{})
        a = d.get('teams',{}).get('away',{})
        print(f"  Match {row['match_id']}: {h.get('name')} ({h.get('logo')}) vs {a.get('name')} ({a.get('logo')})")

except Exception as e:
    import traceback
    print("Error:", e)
    traceback.print_exc()
