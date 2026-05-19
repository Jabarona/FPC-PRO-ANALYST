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
    df = pd.read_sql_query('SELECT * FROM v_fpc_matches LIMIT 1;', engine)
    print('v_fpc_matches columns:', df.columns.tolist())
    
    df_raw = pd.read_sql_query('SELECT * FROM matches_raw LIMIT 1;', engine)
    print('teams raw json:', df_raw['data_raw'].iloc[0]['teams'])
except Exception as e:
    print('Error:', e)
