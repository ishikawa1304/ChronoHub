import bcrypt
from sqlalchemy.orm import Session
from ..models import User


def hash_password(password: str) -> str:
    """
    Hashea la contraseña usando bcrypt con salt único por usuario.
    bcrypt es resistente a ataques de fuerza bruta y rainbow tables.
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña en texto plano contra el hash almacenado.
    """
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_user(db: Session, user_data: dict) -> User | None:
    """
    Crea un nuevo usuario en la base de datos si el correo no está registrado.
    La contraseña es hasheada con bcrypt antes de almacenarse.
    """
    existing_user = db.query(User).filter(User.email == user_data["email"]).first()
    if existing_user:
        return None

    hashed_pwd = hash_password(user_data["password"])
    new_user = User(
        name=user_data["name"],
        email=user_data["email"],
        password=hashed_pwd,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, credentials: dict) -> User | None:
    """
    Autentica a un usuario verificando su correo y contraseña con bcrypt.
    """
    user = db.query(User).filter(User.email == credentials["email"]).first()
    if not user:
        return None

    if verify_password(credentials["password"], user.password):
        return user
    return None


def change_password(db: Session, user_id: str, current_password: str, new_password: str) -> bool:
    """
    Cambia la contraseña del usuario verificando primero la actual.
    Retorna True si el cambio fue exitoso, False si la contraseña actual es incorrecta.
    """
    from uuid import UUID
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        return False

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        return False

    if not verify_password(current_password, user.password):
        return False

    user.password = hash_password(new_password)
    db.commit()
    return True
