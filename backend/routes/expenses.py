import os
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import ExpenseCreate, ExpenseResponse, ExpenseDB
from auth_utils import SECRET_KEY, ALGORITHM
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from models import UserDB
from pydantic import BaseModel

security = HTTPBearer()
router = APIRouter(prefix="/expenses", tags=["expenses"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "expenses")
os.makedirs(UPLOAD_DIR, exist_ok=True)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

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

def require_admin_or_super(current_user=Depends(get_current_user)):
    if current_user.role not in ["Admin", "Super Admin"]:
        raise HTTPException(status_code=403, detail="Only Admin or Super Admin can manage expenses")
    return current_user

@router.get("/")
def get_expenses(category: str = None, db: Session = Depends(get_db), current_user=Depends(require_admin_or_super)):
    query = db.query(ExpenseDB)
    if category and category != "All":
        query = query.filter(ExpenseDB.category == category)
    items = query.order_by(ExpenseDB.created_at.desc()).all()
    return [{
        "id": e.id,
        "title": e.title,
        "category": e.category,
        "amount": e.amount,
        "description": e.description,
        "file_url": e.file_url,
        "created_by": e.created_by,
        "created_by_name": e.created_by_name,
        "created_at": e.created_at.isoformat()
    } for e in items]

@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    title: str = Form(...),
    category: str = Form(...),
    amount: int = Form(...),
    description: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_super)
):
    file_url = None
    if file and file.filename:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
        file_url = f"/uploads/expenses/{filename}"

    db_expense = ExpenseDB(
        title=title,
        category=category,
        amount=amount,
        description=description,
        file_url=file_url,
        created_by=current_user.id,
        created_by_name=current_user.name
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_super)
):
    expense = db.query(ExpenseDB).filter(ExpenseDB.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.file_url:
        filepath = os.path.join(UPLOAD_DIR, os.path.basename(expense.file_url))
        if os.path.exists(filepath):
            os.remove(filepath)
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user=Depends(require_admin_or_super)):
    expenses = db.query(ExpenseDB).all()
    total = sum(e.amount for e in expenses)
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0) + e.amount
    return {
        "totalExpenses": total,
        "byCategory": by_category,
        "count": len(expenses)
    }

class AIAnalysisRequest(BaseModel):
    pass

@router.post("/analyze")
async def analyze_expenses(
    request: AIAnalysisRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_super)
):
    expenses = db.query(ExpenseDB).all()
    if not expenses:
        return {"analysis": "No expenses recorded yet."}

    expense_text = ""
    for e in expenses:
        expense_text += f"- {e.title}: {e.amount} DH ({e.category}) - {e.description or 'No details'}\n"

    prompt = f"""You are a financial advisor for a Moroccan school. Analyze these expenses and provide:

1. Total spending summary
2. Breakdown by category with percentages
3. Identify the biggest expenses and suggest where to reduce costs
4. Recommendations for better budget management
5. Flag any unusual or suspicious expenses

Expenses:
{expense_text}

Respond in French. Keep it concise and practical. Use bullet points."""

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "EduSaaS Expenses"
                },
                json={
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 2000,
                    "temperature": 0.7
                }
            )
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail=f"AI error: {response.text}")
            data = response.json()
            return {"analysis": data["choices"][0]["message"]["content"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
