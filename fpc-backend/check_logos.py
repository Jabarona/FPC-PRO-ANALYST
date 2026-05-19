import urllib.request
import json

try:
    url = 'http://localhost:8000/api/v1/equipos'
    req = urllib.request.urlopen(url)
    teams = json.loads(req.read().decode())['equipos']
    for t in teams:
        print(f"{t['nombre']}: {t['logo']}")
except Exception as e:
    print("Error:", e)
