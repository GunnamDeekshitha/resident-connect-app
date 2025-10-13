from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..deps import get_db
from typing import Optional

router = APIRouter(prefix="/api/apartments", tags=["apartments"])

@router.post("/register", response_model=schemas.ApartmentOut)
def register_apartment(apartment: schemas.ApartmentBase, db: Session = Depends(get_db)):
    existing = crud.get_apartment_by_name(db, apartment.name)
    if existing:
        raise HTTPException(status_code=400, detail="Apartment already registered")
    return crud.create_apartment(db, name=apartment.name, address=apartment.address)

@router.post("/join", response_model=schemas.UserOut)
def join_apartment(
    user_in: schemas.UserSignup,
    access_code: str,
    db: Session = Depends(get_db)
):
    apt = crud.get_apartment_by_code(db, access_code.upper())
    if not apt:
        raise HTTPException(status_code=404, detail="Invalid access code")

    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = crud.create_user(db, user_in, role="user", apartment_id=apt.id)
    return user
