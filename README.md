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
- Filtros interactivos por **Año** (e.g. 2022) y **Torneo** (Apertura / Clausura).
- Renderizado de logos oficiales dinámicos mapeados desde la base de datos en lugar de imágenes estáticas.
- **Totalmente Mobile-Friendly**: En celulares la tabla habilita un scroll horizontal suave para evitar que los datos se corten o distorsionen.

### 3. 🛡️ Directorio de Equipos (`Equipos`)
- Cuadrícula con las tarjetas de los **20 equipos de la Liga BetPlay**.
- **Acordeón Interactivo (Vista rápida)**: Al hacer clic en un equipo, la tarjeta se expande de manera responsiva hacia abajo mostrando información clave rápida:
  - **Estadio**: Dónde juegan de local.
  - **Últimos 5 Partidos (Forma)**: Indicador minimalista de colores: **Verde** (Victoria), **Amarillo** (Empate) y **Rojo** (Derrota).

### 4. ⭐ Espacio de Fidelización (`Mi Equipo`)
- Al ingresar por primera vez, la aplicación le pregunta al usuario su equipo favorito (se guarda de manera persistente en `localStorage`).
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
- **Axios**: Cliente de peticiones HTTP para consumir la API.
- **Vanilla CSS**: Estilos diseñados desde cero (sin Tailwind) para un control absoluto de la respuesta responsive y las micro-animaciones premium.
- **Lucide React**: Biblioteca de iconos vectoriales modernos.

### Base de Datos (PostgreSQL)
- Base de datos relacional robusta.
- **Vista SQL Optimizada (`v_fpc_matches`)**: Creada específicamente para extraer en tiempo récord la URL del logo local y visitante desde el JSONB bruto (`data_raw`) devuelto originalmente por la API de fútbol.

---

## ⚙️ Configuración y Despliegue

### Requisitos Previos
- Docker & Docker Compose instalados.
- Node.js (v18+) instalado localmente.

### Paso 1: Levantar el Backend (FastAPI + PostgreSQL) con Docker
1. Entra a la carpeta del backend:
   ```bash
   cd fpc-backend
   ```
2. Asegúrate de tener tu archivo `.env` configurado con tus credenciales de base de datos.
3. Construye y enciende los contenedores:
   ```bash
   docker-compose up --build
   ```
El backend estará disponible en: [http://localhost:8000](http://localhost:8000)

### Paso 2: Levantar el Frontend (React)
1. Entra a la carpeta del frontend:
   ```bash
   cd ../fpc-frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
El dashboard web estará disponible en: [http://localhost:5173](http://localhost:5173) (o el puerto configurado por Vite).

---

## 📝 Licencia y Derechos de Autor
Desarrollado en **2026**. Todos los derechos reservados. Diseñado para ofrecer la mejor experiencia analítica a los fanáticos y estudiosos del fútbol colombiano. 🇨🇴⚽
