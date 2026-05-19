import urllib.request
import json
import urllib.parse

teams = ['Atlético Nacional', 'América de Cali', 'Alianza FC', 'Deportivo Cali', 'Junior FC']
for name in teams:
    url = f'http://localhost:8000/api/v1/equipos/{urllib.parse.quote(name)}/stats'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            # Leer desde el objeto stats
            stats = data.get('stats', {})
            print(f"{name} -> OK. Estadio: {stats.get('estadio')}, Ciudad: {stats.get('ciudad')}, Forma: {data.get('form')}")
    except Exception as e:
        print(f"{name} -> Error: {e}")
