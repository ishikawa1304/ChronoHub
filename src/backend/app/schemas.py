from pydantic import BaseModel, EmailStr, field_validator
from uuid import UUID
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str = "medium"
    due_date: datetime | None = None

    @field_validator("priority")
    @classmethod
    def priority_must_be_valid(cls, v):
        if v not in ("low", "medium", "high"):
            raise ValueError("La prioridad debe ser 'low', 'medium' o 'high'.")
        return v


class TaskResponse(TaskCreate):
    id: int
    user_id: UUID
    status: str
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- EVENT SCHEMAS ---
class EventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    is_all_day: bool = False
    color_code: str | None = None


class EventResponse(EventCreate):
    id: int
    user_id: UUID
    created_at: datetime | None
    updated_at: datetime | None

    class Config:
        from_attributes = True


# --- PARTICIPANT SCHEMAS ---
class ParticipantCreate(BaseModel):
    email: EmailStr
    status: str = "invited"


class ParticipantResponse(ParticipantCreate):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True


# --- MEETING SCHEMAS ---
class MeetingCreate(BaseModel):
    location: str
    meeting_notes: str | None = None
    event: EventCreate
    participants: list[ParticipantCreate] = []


class MeetingResponse(BaseModel):
    id: int
    event_id: int
    location: str
    meeting_notes: str | None
    reminder_sent: bool
    event: EventResponse
    participants: list[ParticipantResponse]
    created_at: datetime | None
    updated_at: datetime | None

    class Config:
        from_attributes = True


# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("El nombre no puede estar vacío.")
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    avatar_url: str | None = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    avatar_url: str | None = None

    class Config:
        from_attributes = True


# --- AUTH RESPONSE ---
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- CHANGE PASSWORD ---
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("La nueva contraseña debe tener al menos 6 caracteres.")
        return v


# --- UPDATE SCHEMAS ---
class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    due_date: datetime | None = None


class EventUpdate(BaseModel):
    title: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_all_day: bool | None = None
    color_code: str | None = None


class MeetingUpdate(BaseModel):
    location: str | None = None
    meeting_notes: str | None = None
    event: EventUpdate | None = None
    participants: list[ParticipantCreate] | None = None


# --- EMAIL VERIFICATION ---
class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ResendCodeRequest(BaseModel):
    email: EmailStr


class RegisterResponse(BaseModel):
    """Respuesta del registro — requiere verificación de email antes de acceder."""
    message: str
    email: str
    verification_required: bool = True