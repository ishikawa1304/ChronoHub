from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import TaskCreate, TaskResponse, TaskUpdate
from ..services import task_service
from ..auth import get_current_user

router = APIRouter()

@router.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        return task_service.create_new_task(db, task.model_dump(), user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en base de datos: {str(e)}")

@router.get("/tasks", response_model=list[TaskResponse])
def get_user_tasks(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    return task_service.get_tasks_by_user(db, user_id)

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    try:
        updated_task = task_service.update_task(db, task_id, user_id, task.model_dump())
        if not updated_task:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")
        return updated_task
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar tarea: {str(e)}")

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    success = task_service.delete_task(db, task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return None

@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
def update_status(task_id: int, status: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    task = task_service.update_task_status(db, task_id, user_id, status)
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return task

