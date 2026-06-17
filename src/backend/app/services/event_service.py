from sqlalchemy.orm import Session
from ..models import Event

def create_new_event(db: Session, event_data: dict, user_id: str):
    new_event = Event(
        user_id=user_id,
        title=event_data.get("title"),
        start_time=event_data.get("start_time"),
        end_time=event_data.get("end_time"),
        is_all_day=event_data.get("is_all_day", False),
        color_code=event_data.get("color_code", "#4A6CF7")
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

def get_events_by_user(db: Session, user_id: str):
    return db.query(Event).filter(Event.user_id == user_id).all()

def delete_event(db: Session, event_id: int, user_id: str):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user_id).first()
    if event:
        db.delete(event)
        db.commit()
        return True
    return False

def update_event(db: Session, event_id: int, user_id: str, event_data: dict):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == user_id).first()
    if event:
        for key, val in event_data.items():
            if val is not None:
                setattr(event, key, val)
        db.commit()
        db.refresh(event)
        return event
    return None
