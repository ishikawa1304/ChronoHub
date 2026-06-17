import os
import uuid
from pathlib import Path
from uuid import UUID
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, BackgroundTasks
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..database import get_db
from ..models import User
from ..schemas import (
    UserUpdate, UserResponse, UserCreate, UserLogin,
    TokenResponse, ChangePasswordRequest,
    VerifyEmailRequest, ResendCodeRequest, RegisterResponse
)
from ..services import user_service
from ..services import email_service
from ..auth import get_current_user, create_access_token

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Directorio para guardar avatares subidos
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# Thread pool para envío de emails (no bloquear el event loop)
_email_executor = ThreadPoolExecutor(max_workers=2)


def get_base_url() -> str:
    return os.getenv("BASE_URL", "http://127.0.0.1:8000")


def _send_email_bg(to_email: str, user_name: str, code: str):
    """Función para ejecutar el envío de email en un hilo separado."""
    email_service.send_verification_email(to_email, user_name, code)


# ============================================================
# AUTH ENDPOINTS
# ============================================================

@router.post("/auth/register", response_model=RegisterResponse, status_code=201)
@limiter.limit("10/minute")
def register_user(
    request: Request,
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario. Envía un código de 6 dígitos al correo.
    El usuario debe verificar su email antes de poder iniciar sesión.
    """
    user = user_service.create_user(db, user_data.model_dump())
    if not user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")

    # Generar y guardar código de verificación
    code = email_service.create_verification_code(db, user.id)

    # Enviar email en segundo plano (no bloquea la respuesta)
    background_tasks.add_task(_send_email_bg, str(user.email), user.name, code)

    return RegisterResponse(
        message="Cuenta creada. Revisa tu correo para verificar tu cuenta.",
        email=str(user.email),
        verification_required=True
    )


@router.post("/auth/verify-email", response_model=TokenResponse)
@limiter.limit("10/minute")
def verify_email(
    request: Request,
    body: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Verifica el código de 6 dígitos enviado al correo.
    Si es correcto, marca la cuenta como verificada y retorna un JWT.
    """
    user = db.query(User).filter(User.email == str(body.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Esta cuenta ya está verificada. Inicia sesión.")

    is_valid = email_service.verify_code(db, user.id, body.code.strip())
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Código incorrecto o expirado. Solicita uno nuevo."
        )

    # Marcar cuenta como verificada
    user.is_verified = True
    db.commit()
    db.refresh(user)

    # Emitir JWT
    access_token = create_access_token(str(user.id))
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/auth/resend-code", status_code=200)
@limiter.limit("5/minute")
def resend_verification_code(
    request: Request,
    body: ResendCodeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Reenvía un nuevo código de verificación al correo.
    Invalida el código anterior automáticamente.
    """
    user = db.query(User).filter(User.email == str(body.email)).first()
    if not user:
        # No revelar si el correo existe o no
        return {"message": "Si el correo está registrado, recibirás un nuevo código en breve."}

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Esta cuenta ya está verificada.")

    code = email_service.create_verification_code(db, user.id)
    background_tasks.add_task(_send_email_bg, str(user.email), user.name, code)

    return {"message": "Nuevo código enviado. Revisa tu correo."}


@router.post("/auth/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login_user(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Autentica un usuario y devuelve un JWT access token.
    Solo usuarios con email verificado pueden iniciar sesión.
    """
    user = user_service.authenticate_user(db, credentials.model_dump())
    if not user:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Debes verificar tu correo electrónico antes de iniciar sesión."
        )

    access_token = create_access_token(str(user.id))
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/auth/logout", status_code=200)
def logout_user(user_id: str = Depends(get_current_user)):
    """
    Endpoint de logout. El cliente debe eliminar el token almacenado.
    """
    return {"message": "Sesión cerrada exitosamente."}


@router.post("/auth/change-password", status_code=200)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """
    Cambia la contraseña del usuario autenticado verificando la actual.
    """
    success = user_service.change_password(
        db, user_id, body.current_password, body.new_password
    )
    if not success:
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta.")
    return {"message": "Contraseña actualizada exitosamente."}


# ============================================================
# USER PROFILE ENDPOINTS
# ============================================================

@router.get("/user", response_model=UserResponse)
def get_user_profile(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    """Obtiene el perfil del usuario autenticado."""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de ID de usuario inválido.")

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return user


@router.put("/user", response_model=UserResponse)
def update_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Actualiza la información del usuario autenticado."""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de ID de usuario inválido.")

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if user_data.email != user.email:
        email_taken = db.query(User).filter(
            User.email == str(user_data.email),
            User.id != user_uuid
        ).first()
        if email_taken:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está en uso.")

    user.name = user_data.name
    user.email = str(user_data.email)
    if user_data.avatar_url:
        user.avatar_url = user_data.avatar_url

    db.commit()
    db.refresh(user)
    return user


@router.post("/user/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Sube y actualiza el avatar del usuario autenticado."""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de ID de usuario inválido.")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Usa: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo excede el límite de 5 MB.")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        f.write(contents)

    base_url = get_base_url()
    avatar_url = f"{base_url}/uploads/avatars/{filename}"

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        filepath.unlink(missing_ok=True)
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)

    return {"avatar_url": avatar_url, "message": "Avatar subido exitosamente."}


@router.delete("/user", status_code=204)
def delete_user_account(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Elimina permanentemente la cuenta del usuario autenticado."""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de ID de usuario inválido.")

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    db.delete(user)
    db.commit()
    return None