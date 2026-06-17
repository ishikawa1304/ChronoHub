from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import EventCreate, EventResponse, EventUpdate
from ..services import event_service
from ..auth import get_current_user

router = APIRouter()

@router.get("/events", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    return event_service.get_events_by_user(db, user_id)

@router.post("/events", response_model=EventResponse, status_code=201)
def create_event(event: EventCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        return event_service.create_new_event(db, event.model_dump(), user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear evento: {str(e)}")

@router.put("/events/{event_id}", response_model=EventResponse)
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        updated_event = event_service.update_event(db, event_id, user_id, event.model_dump())
        if not updated_event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        return updated_event
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar evento: {str(e)}")

@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    success = event_service.delete_event(db, event_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return None
