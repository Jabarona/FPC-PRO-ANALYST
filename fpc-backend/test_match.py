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

df = pd.read_sql_query('SELECT * FROM v_fpc_matches;', engine)
df['equipo_local'] = df['equipo_local'].apply(standardize_name)

equipo = "Atlético Nacional"
print("Equipo to search:", equipo)
print("Length of equipo:", len(equipo))
print("Chars in equipo:", [ord(c) for c in equipo])

matched = df[df['equipo_local'] == equipo]
print("Matched exact rows:", len(matched))

# Try to find what it actually generated
for name in df['equipo_local'].unique():
    if "nacional" in name.lower():
        print("Found in DB:", name)
        print("Length in DB:", len(name))
        print("Chars in DB:", [ord(c) for c in name])
        print("Are they equal?", name == equipo)
