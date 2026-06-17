from sqlalchemy.orm import Session
from ..models import Event, Meeting, Participant

def create_new_meeting(db: Session, meeting_data: dict, user_id: str):
    event_data = meeting_data.get("event")
    
    # 1. Crear el Evento asociado
    new_event = Event(
        user_id=user_id,
        title=event_data.get("title"),
        start_time=event_data.get("start_time"),
        end_time=event_data.get("end_time"),
        is_all_day=event_data.get("is_all_day", False),
        color_code=event_data.get("color_code", "#6A11CB")  # Por defecto color reunión
    )
    db.add(new_event)
    db.flush()  # Obtener el ID del evento creado
    
    # 2. Crear la Reunión (Meeting)
    new_meeting = Meeting(
        event_id=new_event.id,
        location=meeting_data.get("location"),
        meeting_notes=meeting_data.get("meeting_notes"),
        reminder_sent=False
    )
    db.add(new_meeting)
    db.flush()  # Obtener el ID de la reunión
    
    # 3. Crear los Participantes
    for part in meeting_data.get("participants", []):
        new_participant = Participant(
            meeting_id=new_meeting.id,
            email=part.get("email"),
            status=part.get("status", "invited")
        )
        db.add(new_participant)
        
    db.commit()
    db.refresh(new_meeting)
    return new_meeting

def get_meetings_by_user(db: Session, user_id: str):
    return db.query(Meeting).join(Event).filter(Event.user_id == user_id).all()

def delete_meeting(db: Session, meeting_id: int, user_id: str):
    # Buscar la reunión verificando la pertenencia al usuario por medio del Evento
    meeting = db.query(Meeting).join(Event).filter(
        Meeting.id == meeting_id, 
        Event.user_id == user_id
    ).first()
    
    if meeting:
        # Al eliminar el Evento padre, se eliminará la reunión y participantes por cascada
        event = meeting.event
        db.delete(event)
        db.commit()
        return True
    return False

def update_meeting(db: Session, meeting_id: int, user_id: str, meeting_data: dict):
    # Buscar la reunión verificando la pertenencia al usuario por medio del Evento
    meeting = db.query(Meeting).join(Event).filter(
        Meeting.id == meeting_id, 
        Event.user_id == user_id
    ).first()
    
    if not meeting:
        return None
        
    # 1. Actualizar campos de la reunión
    if "location" in meeting_data and meeting_data["location"] is not None:
        meeting.location = meeting_data["location"]
    if "meeting_notes" in meeting_data:
        meeting.meeting_notes = meeting_data["meeting_notes"]
        
    # 2. Actualizar el evento asociado si se proporcionó
    event_data = meeting_data.get("event")
    if event_data and meeting.event:
        for key, val in event_data.items():
            if val is not None:
                setattr(meeting.event, key, val)
                
    # 3. Actualizar la lista de participantes si se proporcionó
    # Limpiamos los actuales y agregamos los nuevos
    if "participants" in meeting_data and meeting_data["participants"] is not None:
        # Borrar participantes actuales de la reunión
        db.query(Participant).filter(Participant.meeting_id == meeting.id).delete()
        
        # Insertar los nuevos
        for part in meeting_data["participants"]:
            new_participant = Participant(
                meeting_id=meeting.id,
                email=part.get("email"),
                status=part.get("status", "invited")
            )
            db.add(new_participant)
            
    db.commit()
    db.refresh(meeting)
    return meeting
