from sqlalchemy.orm import Session
from ..models import Task
from datetime import datetime, timezone

def create_new_task(db: Session, task_data: dict, user_id: str):
    # Creamos el objeto con todos los campos correspondientes
    new_task = Task(
        title=task_data.get("title"),
        description=task_data.get("description"),
        priority=task_data.get("priority", "medium"),
        due_date=task_data.get("due_date"),
        status="pending",
        user_id=user_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

def get_tasks_by_user(db: Session, user_id: str):
    """
    Consulta la base de datos para obtener todas las tareas de un usuario.
    """
    return db.query(Task).filter(Task.user_id == user_id).all()

def delete_task(db: Session, task_id: int, user_id: str):
    # Buscamos la tarea que pertenezca al usuario antes de borrarla
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if task:
        db.delete(task)
        db.commit()
        return True
    return False

def update_task_status(db: Session, task_id: int, user_id: str, new_status: str):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if task:
        task.status = new_status
        if new_status.lower() == "completed":
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None
        db.commit()
        db.refresh(task)
        return task
    return None

def update_task(db: Session, task_id: int, user_id: str, task_data: dict):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if task:
        for key, val in task_data.items():
            if val is not None:
                setattr(task, key, val)
        db.commit()
        db.refresh(task)
        return task
    return None