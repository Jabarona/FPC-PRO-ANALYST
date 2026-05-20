# 🏆 FPC Pro Analyst — Dashboard de Analítica de Fútbol Colombiano

¡Bienvenido a **FPC Pro Analyst**! Esta es una plataforma web moderna, interactiva y totalmente responsive (móvil-first) dedicada a la analítica de datos históricos y en tiempo real del **Fútbol Profesional Colombiano (Liga BetPlay Dimayor)**.

El proyecto está diseñado con una arquitectura robusta, desacoplada y contenerizada, uniendo el alto rendimiento de **FastAPI** en el Backend con la agilidad de **React** y el poder de **PostgreSQL** para la base de datos.

---

## 📸 Capturas y Diseño Estético
La aplicación cuenta con una interfaz premium y oscura de estilo **Glassmorphism**:
- Paleta de colores elegante: Tonos oscuros profundos con acentos en **amarillo neón** (`#fcd34d`) y **rojo de alta visibilidad**.
- Tipografía moderna e iconografía limpia con **Lucide Icons**.
- Componentes e interacciones dinámicas con micro-animaciones (hovers, transiciones, loaders dinámicos).

---

## 🚀 Características Principales

### 1. 🏠 Dashboard Principal (Home)
- **Partido Destacado**: Muestra el clásico de la jornada con los logos reales cargados directamente de la base de datos.
- **Partidos en Vivo**: Tarjetas interactivas que simulan el estado en vivo de los partidos (goleadores, minutos, posesión).
- **Top 5 Liga**: Tabla minimalista que consume la API en vivo para mostrar a los 5 punteros actuales del torneo con sus escudos oficiales.

### 2. 📊 Tabla de Posiciones Dinámica (`Standings`)
- Filtros interactivos por **Año** (2022, 2023, 2024, 2025, 2026) y **Torneo** (Apertura / Clausura).
- Soporte completo para **Fase Regular** (20 fechas) y **Cuadrangulares** (Grupo A y Grupo B) mediante consultas dinámicas y mapeos históricos oficiales.
- Renderizado de logos oficiales dinámicos mapeados desde la base de datos en lugar de imágenes estáticas.
- **Totalmente Mobile-Friendly**: En celulares la tabla habilita un scroll horizontal suave para evitar que los datos se corten o distorsionen.

### 3. 🛡️ Directorio de Equipos (`Equipos`)
- Cuadrícula con las tarjetas de los **20 equipos de la Liga BetPlay**.
- **Acordeón Interactivo (Vista rápida)**: Al hacer clic en un equipo, la tarjeta se expande de manera responsiva hacia abajo mostrando información clave rápida:
  - **Estadio**: Dónde juegan de local, con un sistema inteligente de herencia de metadatos (e.g. estadios y logos autocompletados para equipos de 2025/2026 con campos vacíos en la API original como Llaneros, Unión Magdalena o La Equidad).
  - **Últimos 5 Partidos (Forma)**: Indicador minimalista de colores: **Verde** (Victoria), **Amarillo** (Empate) y **Rojo** (Derrota).

### 4. ⭐ Espacio de Fidelización (`Mi Equipo`)
- Al ingresar por primera vez, la aplicación le pregunta al usuario su equipo favorito (se guarda de manera de forma persistente en `localStorage`).
- **Dashboard Pro Exclusivo**: En esta pestaña se despliega un análisis táctico avanzado y exclusivo del club del usuario:
  - Posición actual gigante con efecto de resplandor.
  - Estadísticas circulares detalladas de posesión de balón, efectividad de pases, duelos ganados y efectividad general.
  - Lista extendida y detallada de los últimos 5 duelos (con rival, marcador final y estado de victoria/derrota/empate a color).

### 5. 📱 Navegación Responsiva de Vanguardia
- **Menú Hamburguesa**: En móviles la barra lateral tradicional se oculta y da paso a un menú hamburguesa desplegable que se desliza desde la izquierda.
- **Buscador Inteligente**: En celulares el buscador se sitúa justo debajo del menú de acciones principales para facilitar la escritura con una sola mano.

---

## 🛠️ Stack Tecnológico

### Backend (FastAPI + Python)
- **FastAPI**: APIs REST ultrarrápidas y asíncronas.
- **Pandas**: Para procesamiento, limpieza y agregación de estadísticas de partidos históricos.
- **SQLAlchemy & psycopg2**: Conexión eficiente a la base de datos PostgreSQL.
- **Docker**: Entorno contenerizado para asegurar que corra igual en cualquier máquina.

### Frontend (React.js)
- **React**: Biblioteca SPA ágil y modular.
- **Vite**: Empaquetador y servidor de desarrollo ultrarrápido.
- **Vanilla CSS**: Estilos diseñados desde cero (sin Tailwind) para un control absoluto de la respuesta responsive y las micro-animaciones premium.
- **Lucide React**: Biblioteca de iconos vectoriales modernos.

### Base de Datos (PostgreSQL)
- Base de datos relacional robusta.
- **Vista SQL Optimizada (`v_fpc_matches`)**: Creada específicamente para extraer en tiempo récord la URL del logo local y visitante desde el JSONB bruto (`data_raw`) devuelto originalmente por la API de fútbol.
- **Herencia de Metadatos**: Consultas dinámicas sobre el historial de encuentros para completar estadios y ciudades vacíos en temporadas recientes con fallbacks robustos controlados por backend.

---

## 📂 Estructura del Proyecto

* **`/` (Raíz)**: Archivos de orquestación principal y despliegue.
  * `docker-compose.yml`: Define y orquesta los servicios de la aplicación.
  * `.gitignore`: Filtro global mejorado y seguro para evitar subir `.env` o carpetas compiladas.
* **`/fpc-backend`**: Código fuente de la API FastAPI.
  * `main.py`: Endpoints del backend, configuraciones de fallbacks y cálculo estadístico.
  * `auth.py`: Manejo de autenticación (FastAPI Users + JWT).
  * `requirements.txt`: Dependencias del backend.
  * `Dockerfile`: Configuración del contenedor Docker para el backend.
* **`/fpc-frontend`**: Código fuente de la interfaz React.
  * `/src/components`: Componentes principales (`Standings`, `TeamDashboard`, `Home`, `Sidebar`, `Topbar`).
  * `Dockerfile`: Configuración del contenedor Docker para el frontend.

---

## ⚙️ Configuración y Despliegue con Docker Compose

El proyecto está completamente contenerizado y configurado para levantarse de manera unificada mediante Docker Compose.

### Requisitos Previos
- Docker & Docker Compose instalados y en ejecución.

### Paso 1: Configurar Variables de Entorno
Asegúrate de contar con un archivo `.env` en la raíz del backend (`fpc-backend/.env`) con la configuración correcta de la base de datos. Por ejemplo:
```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=fpc_db
```

### Paso 2: Levantar la Aplicación Completa
Ejecuta el siguiente comando en la raíz del proyecto para construir y encender todos los servicios (Base de datos, Backend y Frontend):
```bash
docker compose up --build -d
```

* **Backend (FastAPI)** estará disponible en: [http://localhost:8000](http://localhost:8000)
* **Frontend (React)** estará disponible en: [http://localhost:5173](http://localhost:5173)

### Detener los Servicios
Para apagar los contenedores, ejecuta:
```bash
docker compose down
```

---

## 📝 Licencia y Derechos de Autor
Desarrollado en **2026**. Todos los derechos reservados. Diseñado para ofrecer la mejor experiencia analítica a los fanáticos y estudiosos del fútbol colombiano. 🇨🇴⚽
