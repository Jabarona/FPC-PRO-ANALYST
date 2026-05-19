import json
import pandas as pd
from sqlalchemy import create_engine
import os
import unicodedata

db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'postgres')
db_host = os.environ.get('DB_HOST', 'db')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME', 'fpc_db')

engine = create_engine(f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')

def normalize_team_global(name):
    if not name:
        return ''
    return ''.join(c for c in unicodedata.normalize('NFD', str(name)) if unicodedata.category(c) != 'Mn').lower().strip()

def standardize_name(name):
    if not name or pd.isna(name): return name
    n = normalize_team_global(name)
    if 'alianza' in n: return 'Alianza FC'
    if 'america' in n: return 'América de Cali'
    if 'nacional' in n: return 'Atlético Nacional'
    if 'chico' in n: return 'Boyacá Chicó'
    if 'bucaramanga' in n: return 'Atlético Bucaramanga'
    if 'pasto' in n: return 'Deportivo Pasto'
    if 'pereira' in n: return 'Deportivo Pereira'
    if ('dep' in n and 'cali' in n) or n == 'cali' or n == 'deportivo cali': return 'Deportivo Cali'
    if 'fortaleza' in n: return 'Fortaleza CEIF'
    if 'medellin' in n or n == 'dim': return 'Ind. Medellín'
    if 'santa fe' in n: return 'Ind. Santa Fe'
    if 'junior' in n: return 'Junior FC'
    if 'equidad' in n: return 'La Equidad'
    if 'millonarios' in n: return 'Millonarios FC'
    if 'once' in n: return 'Once Caldas'
    if 'tolima' in n: return 'Deportes Tolima'
    if 'aguilas' in n: return 'Águilas Doradas'
    if 'envigado' in n: return 'Envigado FC'
    if 'patriotas' in n: return 'Patriotas Boyacá'
    if 'jaguares' in n: return 'Jaguares de Córdoba'
    if 'cucuta' in n: return 'Cúcuta Deportivo'
    return name

MAP_CORRECT = {
    "Alianza FC": {
        "logo": "https://media.api-sports.io/football/teams/1142.png",
        "stadium": "Estadio Armando Maestre Pavajeau",
        "city": "Valledupar"
    },
    "América de Cali": {
        "logo": "https://media.api-sports.io/football/teams/1127.png",
        "stadium": "Estadio Olímpico Pascual Guerrero",
        "city": "Santiago de Cali"
    },
    "Atlético Bucaramanga": {
        "logo": "https://media.api-sports.io/football/teams/1131.png",
        "stadium": "Estadio Américo Montanini",
        "city": "Bucaramanga"
    },
    "Atlético Nacional": {
        "logo": "https://media.api-sports.io/football/teams/1135.png",
        "stadium": "Estadio Atanasio Girardot",
        "city": "Medellín"
    },
    "Boyacá Chicó": {
        "logo": "https://media.api-sports.io/football/teams/1120.png",
        "stadium": "Estadio de La Independencia",
        "city": "Tunja"
    },
    "Cúcuta Deportivo": {
        "logo": "https://media.api-sports.io/football/teams/1129.png",
        "stadium": "Estadio General Santander",
        "city": "Cúcuta"
    },
    "Deportes Tolima": {
        "logo": "https://media.api-sports.io/football/teams/1143.png",
        "stadium": "Estadio Manuel Murillo Toro",
        "city": "Ibagué"
    },
    "Deportivo Cali": {
        "logo": "https://media.api-sports.io/football/teams/1132.png",
        "stadium": "Estadio Deportivo Cali",
        "city": "Palmira"
    },
    "Deportivo Pasto": {
        "logo": "https://media.api-sports.io/football/teams/1137.png",
        "stadium": "Estadio Departamental Libertad",
        "city": "San Juan de Pasto"
    },
    "Deportivo Pereira": {
        "logo": "https://media.api-sports.io/football/teams/1138.png",
        "stadium": "Estadio Hernán Ramírez Villegas",
        "city": "Pereira"
    },
    "Fortaleza CEIF": {
        "logo": "https://media.api-sports.io/football/teams/1141.png",
        "stadium": "Estadio Metropolitano de Techo",
        "city": "Bogotá, D.C."
    },
    "Ind. Medellín": {
        "logo": "https://media.api-sports.io/football/teams/1134.png",
        "stadium": "Estadio Atanasio Girardot",
        "city": "Medellín"
    },
    "Ind. Santa Fe": {
        "logo": "https://media.api-sports.io/football/teams/1139.png",
        "stadium": "Estadio Nemesio Camacho El Campín",
        "city": "Bogotá, D.C."
    },
    "Inter de Bogotá": {
        "logo": "https://media.api-sports.io/football/teams/1126.png",
        "stadium": "Estadio de Techo",
        "city": "Bogotá, D.C."
    },
    "Jaguares de Córdoba": {
        "logo": "https://media.api-sports.io/football/teams/1140.png",
        "stadium": "Estadio de Fútbol Jaraguay de Montería",
        "city": "Montería"
    },
    "Junior FC": {
        "logo": "https://media.api-sports.io/football/teams/1133.png",
        "stadium": "Estadio Metropolitano Roberto Meléndez",
        "city": "Barranquilla"
    },
    "Llaneros": {
        "logo": "https://media.api-sports.io/football/teams/1123.png",
        "stadium": "Estadio Bello Horizonte - Rey Pelé",
        "city": "Villavicencio"
    },
    "Millonarios FC": {
        "logo": "https://media.api-sports.io/football/teams/1125.png",
        "stadium": "Estadio Nemesio Camacho El Campín",
        "city": "Bogotá, D.C."
    },
    "Once Caldas": {
        "logo": "https://media.api-sports.io/football/teams/1136.png",
        "stadium": "Estadio Palogrande",
        "city": "Manizales"
    },
    "Águilas Doradas": {
        "logo": "https://media.api-sports.io/football/teams/1144.png",
        "stadium": "Estadio Alberto Grisales",
        "city": "Rionegro"
    }
}

try:
    print("1. Cargando partidos del 2026 para corregir los estadios y logos...")
    df_2026 = pd.read_sql_query("SELECT match_id, data_raw FROM matches_raw WHERE season = 2026;", engine)
    
    updated_count = 0
    for idx, row in df_2026.iterrows():
        match_id = row['match_id']
        data = row['data_raw']
        if not data:
            data = {}
            
        if 'teams' not in data: data['teams'] = {'home': {}, 'away': {}}
        if 'fixture' not in data: data['fixture'] = {'venue': {}}
        if 'venue' not in data['fixture']: data['fixture']['venue'] = {}
        
        home = data['teams'].setdefault('home', {})
        away = data['teams'].setdefault('away', {})
        venue = data['fixture'].setdefault('venue', {})
        
        home_name = home.get('name')
        away_name = away.get('name')
        
        modified = False
        
        if home_name:
            std_home = standardize_name(home_name)
            info = MAP_CORRECT.get(std_home)
            if info:
                home['logo'] = info['logo']
                venue['name'] = info['stadium']
                venue['city'] = info['city']
                modified = True
                    
        if away_name:
            std_away = standardize_name(away_name)
            info = MAP_CORRECT.get(std_away)
            if info:
                away['logo'] = info['logo']
                modified = True
                    
        if modified:
            from sqlalchemy.sql import text
            with engine.connect() as conn:
                conn.execute(
                    text("UPDATE matches_raw SET data_raw = :json_data WHERE match_id = :mid"),
                    {"json_data": json.dumps(data), "mid": match_id}
                )
                conn.commit()
            updated_count += 1

    print(f"\n¡Base de datos corregida! Se sobreescribieron físicamente {updated_count} partidos del 2026 en PostgreSQL con sus logos y estadios 100% correctos.")
except Exception as e:
    print("Error:", e)
