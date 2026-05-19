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
    # 1. Obtener la definición de la vista v_fpc_matches
    query_view = """
        SELECT pg_get_viewdef('v_fpc_matches', true) as view_def;
    """
    df_view = pd.read_sql_query(query_view, engine)
    print("--- Definición de la vista v_fpc_matches ---")
    print(df_view.iloc[0]['view_def'])

    # 2. Ver la estructura de una fila de matches_raw
    query_raw = "SELECT * FROM matches_raw LIMIT 1;"
    df_raw = pd.read_sql_query(query_raw, engine)
    print("\n--- Columnas de matches_raw ---")
    print(df_raw.columns.tolist())
    
except Exception as e:
    print("Error:", e)
