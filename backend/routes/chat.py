from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import MessageDB, UserDB, MessageCreate, Message
from routes.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/contacts")
def get_contacts(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get all active users as potential contacts
    users = db.query(UserDB).filter(UserDB.id != current_user.id, UserDB.status == "Active").all()
    return [{"id": u.id, "name": u.name, "role": u.role, "online": True} for u in users]

@router.get("/messages/{contact_id}", response_model=List[Message])
def get_messages(contact_id: int, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(MessageDB).filter(
        ((MessageDB.sender_id == current_user.id) & (MessageDB.receiver_id == contact_id)) |
        ((MessageDB.sender_id == contact_id) & (MessageDB.receiver_id == current_user.id))
    ).order_by(MessageDB.timestamp.asc()).all()
    return messages

@router.post("/send", response_model=Message)
def send_message(msg: MessageCreate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    db_msg = MessageDB(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg
