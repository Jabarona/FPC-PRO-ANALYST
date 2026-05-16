# client.py
import requests
from config import BASE_URL, API_KEY, API_HOST

class FootballAPIClient:
    def __init__(self):
        self.headers = {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
        }

    def _get(self, endpoint: str, params: dict = None):
        """Maneja las peticiones GET de forma segura."""
        url = f"{BASE_URL}/{endpoint}"
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error de conexión con la API: {e}")
            return None

    def get_fpc_leagues(self):
        """Consulta las ligas de Colombia configuradas como vigentes."""
        return self._get("leagues", {"country": "Colombia", "current": "true"})

    # === ESTA ES LA FUNCIÓN QUE FALTA ===
    def get_fixtures(self, league_id: int, season: int):
        """Obtiene todos los partidos de una liga y temporada específica."""
        return self._get("fixtures", {"league": league_id, "season": season})