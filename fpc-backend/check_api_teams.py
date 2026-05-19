import requests
import os

API_KEY = "720de20c8382f79842383903f40e0741"
headers = {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
}

# Liga BetPlay = league 239
url = "https://v3.football.api-sports.io/teams"
params = {"league": 239, "season": 2024}

print("Consultando api-sports...")
resp = requests.get(url, headers=headers, params=params)
data = resp.json()

if 'response' in data and len(data['response']) > 0:
    print(f"\n--- LOGOS REALES DE API-SPORTS (Liga 239) ---")
    for item in sorted(data['response'], key=lambda x: x['team']['name']):
        team = item['team']
        venue = item.get('venue', {})
        print(f"ID: {team['id']} | {team['name']} -> {team['logo']}")
        if venue:
            print(f"   Estadio: {venue.get('name','?')} | Ciudad: {venue.get('city','?')}")
else:
    print("Respuesta:", data)
    # Verificar limites
    if 'errors' in data:
        print("ERRORES:", data['errors'])
