from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import MeetingCreate, MeetingResponse, MeetingUpdate
from ..services import meeting_service
from ..auth import get_current_user

router = APIRouter()

@router.get("/meetings", response_model=list[MeetingResponse])
def get_meetings(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    return meeting_service.get_meetings_by_user(db, user_id)

@router.post("/meetings", response_model=MeetingResponse, status_code=201)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        return meeting_service.create_new_meeting(db, meeting.model_dump(), user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear reunión: {str(e)}")

@router.put("/meetings/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, meeting: MeetingUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        updated_meeting = meeting_service.update_meeting(db, meeting_id, user_id, meeting.model_dump())
        if not updated_meeting:
            raise HTTPException(status_code=404, detail="Reunión no encontrada")
        return updated_meeting
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar reunión: {str(e)}")

@router.delete("/meetings/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    success = meeting_service.delete_meeting(db, meeting_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reunión no encontrada")
    return None
