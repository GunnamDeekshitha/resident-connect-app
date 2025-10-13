from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from .. import schemas, crud, utils, models
from ..deps import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- Signup ---
@router.post("/signup", response_model=schemas.UserOut)
def signup(user_in: schemas.UserSignup, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    apartment_id = None
    if user_in.access_code:
        apt = crud.get_apartment_by_code(db, user_in.access_code.upper())
        if not apt:
            raise HTTPException(status_code=404, detail="Invalid access code")
        apartment_id = apt.id

    # forward the full signup payload (includes optional flat) to create_user
    user = crud.create_user(db, user_in, role="user", apartment_id=apartment_id)
    return user

# --- Login ---
@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = utils.create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "name": user.name,
        "flat": user.flat
    }

# --- Register Admin for Apartment ---
@router.post("/register-admin")
def register_admin_for_apartment(
    apartment: schemas.ApartmentBase,
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    existing_apt = crud.get_apartment_by_name(db, apartment.name)
    if existing_apt:
        raise HTTPException(status_code=400, detail="Apartment already exists")

    apt = crud.create_apartment(db, name=apartment.name, address=apartment.address)
    user = crud.create_user(db, user_in, role="admin", apartment_id=apt.id)
    return {"user": user, "access_code": apt.access_code}
