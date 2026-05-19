import pandas as pd
from sqlalchemy import create_engine
import os

db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'postgres')
db_host = os.environ.get('DB_HOST', 'db')
db_port = os.environ.get('DB_PORT', '5432')
db_name = os.environ.get('DB_NAME', 'fpc_db')

engine = create_engine(f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}')

try:
    # 1. Traer un partido cualquiera para ver si tiene datos de venue en data_raw
    query_raw = "SELECT match_id, data_raw->'fixture'->'venue' as venue, data_raw->'teams'->'home'->>'name' as home_team FROM matches_raw LIMIT 5;"
    df_raw = pd.read_sql_query(query_raw, engine)
    print("--- 5 partidos en matches_raw ---")
    for idx, row in df_raw.iterrows():
        print(f"Match ID: {row['match_id']} | Home: {row['home_team']} | Venue: {row['venue']}")

    # 2. Ver por qué Alianza FC devuelve estadio y ciudad vacíos
    # Hagamos una consulta con el nombre normalizado o con ILIKE
    query_alianza = "SELECT match_id, data_raw->'fixture'->'venue'->>'name' as stadium, data_raw->'fixture'->'venue'->>'city' as city, data_raw->'teams'->'home'->>'name' as home_team FROM matches_raw WHERE data_raw->'teams'->'home'->>'name' ILIKE '%%Alianza%%' LIMIT 5;"
    df_alianza = pd.read_sql_query(query_alianza, engine)
    print("\n--- Alianza FC en matches_raw ---")
    print(df_alianza)

except Exception as e:
    print("Error:", e)
