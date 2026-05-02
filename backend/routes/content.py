import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import ContentCreate, ContentDB, ContentResponse
from auth_utils import SECRET_KEY, ALGORITHM
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from models import UserDB

security = HTTPBearer()
router = APIRouter(prefix="/content", tags=["content"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_teacher_or_admin(current_user=Depends(get_current_user)):
    if current_user.role not in ["Teacher", "Admin", "Super Admin"]:
        raise HTTPException(status_code=403, detail="Only Teachers and Admins can manage content")
    return current_user

@router.get("/")
def get_content(subject: str = None, db: Session = Depends(get_db)):
    query = db.query(ContentDB)
    if subject and subject != "All":
        query = query.filter(ContentDB.subject == subject)
    items = query.order_by(ContentDB.created_at.desc()).all()
    return [{
        "id": c.id,
        "title": c.title,
        "subject": c.subject,
        "content_type": c.content_type,
        "file_url": c.file_url,
        "description": c.description,
        "teacher_id": c.teacher_id,
        "teacher_name": c.teacher_name,
        "target_class": c.target_class,
        "created_at": c.created_at.isoformat()
    } for c in items]

@router.post("/", response_model=ContentResponse)
def create_content(
    data: ContentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_teacher_or_admin)
):
    db_content = ContentDB(**data.dict())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@router.post("/upload", response_model=ContentResponse)
async def upload_content(
    title: str = Form(...),
    subject: str = Form(...),
    content_type: str = Form(...),
    description: str = Form(None),
    target_class: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_teacher_or_admin)
):
    file_url = None
    if file and file.filename:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
        file_url = f"/uploads/{filename}"

    db_content = ContentDB(
        title=title,
        subject=subject,
        content_type=content_type,
        file_url=file_url,
        description=description,
        teacher_id=current_user.id,
        teacher_name=current_user.name,
        target_class=target_class
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_teacher_or_admin)
):
    content = db.query(ContentDB).filter(ContentDB.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if content.file_url:
        filepath = os.path.join(UPLOAD_DIR, os.path.basename(content.file_url))
        if os.path.exists(filepath):
            os.remove(filepath)
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}
