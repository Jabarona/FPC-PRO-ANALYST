# Usamos Alpine 
FROM python:3.10-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copiamos el archivo de requerimientos primero para el proceso de compilación
COPY requirements.txt .

# 1. Actualizamos el gestor e instalamos los parches de seguridad (apk upgrade)
# 2. Añadimos herramientas necesarias para Pandas/Postgres
# 3. Instalamos las librerías de Python y borramos la basura de compilación en una sola capa
RUN apk update && apk upgrade && \
    apk add --no-cache libpq libstdc++ && \
    apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev g++ python3-dev && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del .build-deps

# Copiamos el resto de tu código fuente
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]