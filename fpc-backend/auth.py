import os
import uuid
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users import FastAPIUsers, schemas, models
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import async_sessionmaker

# --- 1. CONFIGURACIÓN DE BASE DE DATOS ASÍNCRONA ---
# Construimos la URL asíncrona para asyncpg
db_user = os.getenv("DB_USER", "postgres")
db_password = os.getenv("DB_PASSWORD", "postgres")
db_host = os.getenv("DB_HOST", "db")
db_port = os.getenv("DB_PORT", "5432")
db_name = os.getenv("DB_NAME", "fpc_db")

DATABASE_URL = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# --- 2. MODELO DE USUARIO (DB) ---
class User(SQLAlchemyBaseUserTableUUID, Base):
    """
    Modelo en la Base de Datos que extiende el usuario por defecto de FastAPI Users
    y añade el campo 'equipo_favorito'.
    """
    equipo_favorito: Mapped[str] = mapped_column(nullable=True)

# Función para inicializar las tablas en DB automáticamente
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)

# --- 3. ESQUEMAS DE PYDANTIC PARA CREAR/LEER USUARIOS ---
class UserRead(schemas.BaseUser[uuid.UUID]):
    equipo_favorito: str | None

class UserCreate(schemas.BaseUserCreate):
    equipo_favorito: str | None

class UserUpdate(schemas.BaseUserUpdate):
    equipo_favorito: str | None

# --- 4. CONFIGURACIÓN DE AUTENTICACIÓN JWT ---
SECRET = "SECRET_KEY_SUPER_SECRETA_Y_LARGA_12345" # En producción, usa variables de entorno

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# --- 5. GESTOR DE USUARIOS ---
from fastapi_users import BaseUserManager, UUIDIDMixin

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request=None):
        print(f"User {user.id} has registered. Favorite team: {user.equipo_favorito}")

async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

# --- 6. INSTANCIA PRINCIPAL DE FASTAPI USERS ---
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
