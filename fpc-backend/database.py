# database.py
import os
import psycopg2
import json

def get_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )

def init_db():
    """Crea la tabla RAW para almacenar el JSON crudo de la API."""
    # Guardamos el match_id como PK para actualizar el partido si cambia de estado,
    # y una columna 'data_raw' de tipo JSONB para meter TODO el JSON de ese partido.
    command = """
    CREATE TABLE IF NOT EXISTS matches_raw (
        match_id INTEGER PRIMARY KEY,
        league_id INTEGER NOT NULL,
        season INTEGER NOT NULL,
        data_raw JSONB NOT NULL,
        loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(command)
        cursor.close()
        conn.commit()
        print("[DB] Tabla RAW (JSONB) inicializada correctamente.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"[DB Error] Error al inicializar: {error}")
    finally:
        if conn is not None:
            conn.close()

def save_raw_fixtures(fixtures_list):
    """Guarda el JSON crudo completo de cada partido directamente en Postgres."""
    insert_query = """
        INSERT INTO matches_raw (match_id, league_id, season, data_raw)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (match_id) 
        DO UPDATE SET 
            data_raw = EXCLUDED.data_raw,
            loaded_at = CURRENT_TIMESTAMP;
    """
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        for item in fixtures_list:
            match_id = item['fixture']['id']
            league_id = item['league']['id']
            season = item['league']['season']
            
            # Convertimos el diccionario de Python a un String JSON válido para Postgres
            json_data = json.dumps(item)
            
            cursor.execute(insert_query, (match_id, league_id, season, json_data))
            
        cursor.close()
        conn.commit()
        print(f"[DB] ¡Éxito! Se guardaron {len(fixtures_list)} JSONs crudos en la tabla matches_raw.")
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"[DB Error] Error al guardar JSON crudo: {error}")
    finally:
        if conn is not None:
            conn.close()