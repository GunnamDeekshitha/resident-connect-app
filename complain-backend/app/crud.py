# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from typing import Optional
from .utils import get_password_hash

# --- Users ---
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def list_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def list_users_for_apartment(db: Session, apartment_id: int, skip: int = 0, limit: int = 100):
    if not apartment_id:
        return []
    return db.query(models.User).filter(models.User.apartment_id == apartment_id).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_in: schemas.UserCreate, role: Optional[str] = None, apartment_id: Optional[int] = None):
    hashed = get_password_hash(user_in.password)
    # Normalize role to the UserRole enum used by the model
    role_val = role or models.UserRole.user
    if isinstance(role_val, str):
        try:
            role_val = models.UserRole(role_val)
        except ValueError:  
            # fallback to user
            role_val = models.UserRole.user

    user = models.User(
        email=user_in.email,
        name=user_in.name,
        flat=getattr(user_in, 'flat', None),
        hashed_password=hashed,
        role=role_val,
        apartment_id=apartment_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_profile(db: Session, user_id: int, user_in: schemas.UserUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    update_data = user_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user


def update_user_role(db: Session, user_id: int, role: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        # accept either enum value or string
        if isinstance(role, str):
            try:
                user.role = models.UserRole(role)
            except ValueError:
                return None
        else:
            user.role = role
        db.commit()
        db.refresh(user)
    return user


def update_user_flat(db: Session, user_id: int, flat: Optional[str]):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    user.flat = flat
    db.commit()
    db.refresh(user)
    return user

def get_user_by_reset_token(db: Session, token: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.reset_password_token == token).first()

def update_user_password(db: Session, user: models.User, new_password: str):
    user.hashed_password = get_password_hash(new_password)
    user.reset_password_token = None
    user.reset_password_token_expires = None
    db.commit()
    db.refresh(user)
    return user

# --- Apartment CRUD ---
def create_apartment(db: Session, name: str, address: Optional[str] = None):
    import secrets
    code = secrets.token_hex(3).upper()  # e.g. "A1B2C3"
    apt = models.Apartment(name=name, address=address, access_code=code)
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return apt

def get_apartment_by_name(db: Session, name: str):
    return db.query(models.Apartment).filter(models.Apartment.name == name).first()

def get_apartment_by_code(db: Session, code: str):
    return db.query(models.Apartment).filter(models.Apartment.access_code == code).first()

# --- Complaints CRUD ---
def create_complaint(db: Session, user_id: int, complaint_in: schemas.ComplaintCreate):
    comp = models.Complaint(
        title=complaint_in.title,
        description=complaint_in.description,
        category=complaint_in.category,
        priority=complaint_in.priority or "Medium",
        user_id=user_id,
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

def get_complaint(db: Session, complaint_id: int):
    return db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()

def list_complaints_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Complaint).filter(models.Complaint.user_id == user_id).offset(skip).limit(limit).all()

def list_all_complaints(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None, search: Optional[str] = None):
    q = db.query(models.Complaint).join(models.User)
    if status:
        # normalize incoming status
        status_norm = status.strip().lower()
        # map friendly strings
        if status_norm == "in progress":
            status_norm = "inprogress"
        if status_norm == "completed":
            status_norm = "resolved"
        try:
            q = q.filter(models.Complaint.status == models.ComplaintStatus(status_norm))
        except Exception:
            # ignore invalid status filter
            pass
    if search:
        term = f"%{search}%"
        q = q.filter((models.Complaint.title.ilike(term)) | (models.User.name.ilike(term)) | (models.User.email.ilike(term)))
    return q.offset(skip).limit(limit).all()


def list_all_complaints_for_apartment(db: Session, apartment_id: int, skip: int = 0, limit: int = 100, status: Optional[str] = None, search: Optional[str] = None):
    if not apartment_id:
        return []
    q = db.query(models.Complaint).join(models.User).filter(models.User.apartment_id == apartment_id)
    if status:
        status_norm = status.strip().lower()
        if status_norm == "in progress":
            status_norm = "inprogress"
        if status_norm == "completed":
            status_norm = "resolved"
        try:
            q = q.filter(models.Complaint.status == models.ComplaintStatus(status_norm))
        except Exception:
            pass
    if search:
        term = f"%{search}%"
        q = q.filter((models.Complaint.title.ilike(term)) | (models.User.name.ilike(term)) | (models.User.email.ilike(term)))
    return q.offset(skip).limit(limit).all()

def list_complaints_for_apartment(db: Session, apartment_id: int, limit: int = 5):
    if not apartment_id:
        return []
    q = db.query(models.Complaint).join(models.User).filter(models.User.apartment_id == apartment_id).order_by(models.Complaint.created_at.desc()).limit(limit)
    return q.all()

def complaint_counts_for_apartment(db: Session, apartment_id: int):
    # returns dict with total and per-status counts
    if not apartment_id:
        return {"total": 0, "pending": 0, "inprogress": 0, "resolved": 0}
    total = db.query(models.Complaint).join(models.User).filter(models.User.apartment_id == apartment_id).count()
    pending = db.query(models.Complaint).join(models.User).filter(models.User.apartment_id == apartment_id, models.Complaint.status == models.ComplaintStatus.pending).count()
    inprogress = db.query(models.Complaint).join(models.User).filter(models.User.apartment_id == apartment_id, models.Complaint.status == models.ComplaintStatus.inprogress).count()
    resolved = db.query(models.Complaint).join(models.User).filter(models.User.apartment_id == apartment_id, models.Complaint.status == models.ComplaintStatus.resolved).count()
    return {"total": total, "pending": pending, "inprogress": inprogress, "resolved": resolved}

def update_complaint(db: Session, complaint: models.Complaint, updates: dict):
    for k, v in updates.items():
        if not hasattr(complaint, k):
            continue
        # Validate status against enum to avoid DB enum errors
        if k == "status":
            if v is None:
                continue
            # Map legacy/alternate values to the enum canonical values
            if isinstance(v, str):
                v_normalized = v.strip().lower()
                if v_normalized == "completed":
                    v_normalized = "resolved"
                # Accept enum or string that maps to enum
                try:
                    v_enum = models.ComplaintStatus(v_normalized)
                except ValueError:
                    # invalid status value
                    return None
                setattr(complaint, k, v_enum)
            else:
                setattr(complaint, k, v)
        else:
            setattr(complaint, k, v)
    db.commit()
    db.refresh(complaint)
    return complaint

def delete_complaint(db: Session, complaint: models.Complaint):
    db.delete(complaint)
    db.commit()
