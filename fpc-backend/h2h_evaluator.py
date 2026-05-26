# h2h_evaluator.py
import os
import argparse
import psycopg2
from dotenv import load_dotenv

# Cargar variables de entorno del backend
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

def get_db_connection():
    hosts_to_try = []
    env_host = os.getenv("DB_HOST")
    if env_host:
        hosts_to_try.append(env_host)
    if "localhost" not in hosts_to_try:
        hosts_to_try.append("localhost")
    if "127.0.0.1" not in hosts_to_try:
        hosts_to_try.append("127.0.0.1")

    dbname = os.getenv("DB_NAME", "fpc_db")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "2934bd7b")
    port = os.getenv("DB_PORT", "5432")

    last_err = None
    for host in hosts_to_try:
        try:
            conn = psycopg2.connect(
                dbname=dbname,
                user=user,
                password=password,
                host=host,
                port=port,
                connect_timeout=3
            )
            return conn
        except Exception as e:
            last_err = e
            continue
    raise Exception(f"No se pudo conectar a la base de datos en ninguno de los hosts intentados {hosts_to_try}. Error: {last_err}")

def get_h2h_data(team_a, team_b, limit=5):
    """
    Obtiene y calcula las métricas de H2H para dos equipos dados.
    Esta función es reutilizable tanto por el CLI como por la API del backend.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT season, jornada, equipo_local, goles_local, goles_visitante, equipo_visitante, fecha_partido
        FROM v_fpc_matches
        WHERE (equipo_local = %s AND equipo_visitante = %s)
           OR (equipo_local = %s AND equipo_visitante = %s)
        ORDER BY fecha_partido DESC
        LIMIT %s;
    """

    try:
        cur.execute(query, (team_a, team_b, team_b, team_a, limit))
        rows = cur.fetchall()
    finally:
        cur.close()
        conn.close()

    if not rows:
        return None

    matches_list = []
    wins_a = 0
    wins_b = 0
    draws = 0
    total_goals = 0
    goals_a = 0
    goals_b = 0

    for r in rows:
        season, jornada, local, goles_local, goles_visitante, visitante, fecha = r
        g_local = int(goles_local) if goles_local is not None else 0
        g_visitante = int(goles_visitante) if goles_visitante is not None else 0

        # Identificar qué goles corresponden a qué equipo
        # y quién ganó el partido
        local_is_a = (local.lower() == team_a.lower())
        
        g_a = g_local if local_is_a else g_visitante
        g_b = g_visitante if local_is_a else g_local

        goals_a += g_a
        goals_b += g_b
        total_goals += (g_local + g_visitante)

        # Determinar resultado
        if g_local == g_visitante:
            resultado = "Empate"
            draws += 1
        elif (local_is_a and g_local > g_visitante) or (not local_is_a and g_visitante > g_local):
            resultado = f"Ganó {team_a}"
            wins_a += 1
        else:
            resultado = f"Ganó {team_b}"
            wins_b += 1

        matches_list.append({
            "season": season,
            "jornada": jornada,
            "local": local,
            "goles_local": g_local,
            "goles_visitante": g_visitante,
            "visitante": visitante,
            "resultado": resultado
        })

    num_matches = len(rows)
    pct_win_a = round((wins_a / num_matches) * 100, 1)
    pct_win_b = round((wins_b / num_matches) * 100, 1)
    pct_draw = round((draws / num_matches) * 100, 1)
    avg_goals = round(total_goals / num_matches, 2)

    # Determinar ventaja
    if wins_a > wins_b:
        ventaja = team_a
        justificacion = f"Tiene {wins_a - wins_b} victoria(s) más en los últimos {num_matches} encuentros."
    elif wins_b > wins_a:
        ventaja = team_b
        justificacion = f"Tiene {wins_b - wins_a} victoria(s) más en los últimos {num_matches} encuentros."
    else:
        if goals_a > goals_b:
            ventaja = team_a
            justificacion = f"Igualan en victorias ({wins_a}), pero {team_a} tiene mejor diferencia de goles (+{goals_a - goals_b}) en el H2H."
        elif goals_b > goals_a:
            ventaja = team_b
            justificacion = f"Igualan en victorias ({wins_b}), pero {team_b} tiene mejor diferencia de goles (+{goals_b - goals_a}) en el H2H."
        else:
            ventaja = "Ninguno"
            justificacion = "Están estrictamente empatados en victorias y goles en sus últimos duelos directos."

    return {
        "team_a": team_a,
        "team_b": team_b,
        "total_partidos": num_matches,
        "victorias_a": wins_a,
        "victorias_b": wins_b,
        "empates": draws,
        "porcentaje_a": pct_win_a,
        "porcentaje_b": pct_win_b,
        "porcentaje_empate": pct_draw,
        "goles_a": goals_a,
        "goles_b": goals_b,
        "goles_promedio": avg_goals,
        "ventaja": ventaja,
        "justificacion": justificacion,
        "partidos": matches_list
    }

def main():
    parser = argparse.ArgumentParser(description='Evaluador reutilizable de historial directo (H2H) entre dos equipos de fútbol.')
    parser.add_argument('--team1', type=str, default='Atletico Nacional', help='Nombre del primer equipo (Equipo A)')
    parser.add_argument('--team2', type=str, default='Junior', help='Nombre del segundo equipo (Equipo B)')
    parser.add_argument('--limit', type=int, default=5, help='Cantidad de últimos partidos a evaluar')

    args = parser.parse_args()

    print("=" * 65)
    print(f"  EVALUADOR H2H REUTILIZABLE: {args.team1.upper()} VS {args.team2.upper()}")
    print(f"  Analizando los últimos {args.limit} duelos directos registrados...")
    print("=" * 65)

    try:
        data = get_h2h_data(args.team1, args.team2, args.limit)
    except Exception as e:
        print(f"Error al obtener los datos del historial: {e}")
        return

    if not data:
        print(f"No se registraron enfrentamientos directos recientes entre '{args.team1}' y '{args.team2}'.")
        return

    print("\nHISTORIAL DE PARTIDOS DIRECTOS:")
    print("-" * 65)
    for m in data["partidos"]:
        print(f"Temp {m['season']} | {m['jornada']:<15} | {m['local']} {m['goles_local']} - {m['goles_visitante']} {m['visitante']} -> {m['resultado']}")
    print("-" * 65)

    print(f"\nMÉTRICAS Y PORCENTAJES DE RENDIMIENTO (Últimos {data['total_partidos']} duelos):")
    print(f" - Porcentaje Victoria {data['team_a']}: {data['porcentaje_a']}% ({data['victorias_a']} partidos)")
    print(f" - Porcentaje Victoria {data['team_b']}: {data['porcentaje_b']}% ({data['victorias_b']} partidos)")
    print(f" - Porcentaje de Empates:            {data['porcentaje_empate']}% ({data['empates']} partidos)")
    print(f" - Promedio Goles por Partido:       {data['goles_promedio']} goles (Total: {data['goles_a'] + data['goles_b']} goles)")
    print("-" * 65)
    print(f"ANÁLISIS DE VENTAJA:")
    print(f" >> Ventaja: {data['ventaja'].upper()}")
    print(f" >> Criterio: {data['justificacion']}")
    print("=" * 65)

if __name__ == '__main__':
    main()
