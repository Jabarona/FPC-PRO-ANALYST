import os
from pathlib import Path
from dotenv import load_dotenv

# Encuentra la ruta absoluta de la carpeta del proyecto
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

API_KEY = os.getenv("FOOTBALL_API_KEY")
API_HOST = os.getenv("FOOTBALL_API_HOST")
BASE_URL = f"https://{API_HOST}"

if not API_KEY or API_KEY == "TU_API_KEY_AQUI":
    raise ValueError("Error: No has configurado tu API Key real en el archivo .env")