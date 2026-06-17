import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cargar variables de entorno
load_dotenv()

# URL DE CONEXIÓN
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(backend_dir)
    db_path = os.path.join(backend_root, "chronohub.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
    print(f"[DB INFO] DATABASE_URL no configurada. Usando SQLite local por defecto en: {db_path}", flush=True)

# Crear el motor de conexión
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()