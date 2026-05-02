from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import MessageDB, UserDB, MessageCreate, Message
from routes.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/contacts")
def get_contacts(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    contacts = db.query(UserDB).filter(UserDB.id != current_user.id, UserDB.status == "Active").all()
    result = [{"id": u.id, "name": u.name, "role": u.role, "online": True} for u in contacts]
    
    # Add group chat for Admins and Super Admins
    if current_user.role in ["Admin", "Super Admin"]:
        group_members = db.query(UserDB).filter(
            UserDB.status == "Active",
            UserDB.role.in_(["Admin", "Super Admin", "Teacher"])
        ).all()
        member_names = [u.name for u in group_members]
        result.insert(0, {
            "id": 0,
            "name": "Staff Group",
            "role": f"{len(member_names)} members",
            "online": True,
            "is_group": True
        })
    
    return result

@router.get("/messages/{contact_id}", response_model=List[Message])
def get_messages(contact_id: int, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if contact_id == 0:
        # Group messages
        messages = db.query(MessageDB).filter(
            MessageDB.is_group == True
        ).order_by(MessageDB.timestamp.asc()).all()
        return messages
    else:
        # Direct messages
        messages = db.query(MessageDB).filter(
            ((MessageDB.sender_id == current_user.id) & (MessageDB.receiver_id == contact_id)) |
            ((MessageDB.sender_id == contact_id) & (MessageDB.receiver_id == current_user.id))
        ).order_by(MessageDB.timestamp.asc()).all()
        return messages

@router.post("/send", response_model=Message)
def send_message(msg: MessageCreate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    # Group message
    if msg.receiver_id == 0 and current_user.role in ["Admin", "Super Admin"]:
        db_msg = MessageDB(
            sender_id=current_user.id,
            receiver_id=0,
            content=msg.content,
            is_group=True
        )
    else:
        db_msg = MessageDB(
            sender_id=current_user.id,
            receiver_id=msg.receiver_id,
            content=msg.content
        )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg
