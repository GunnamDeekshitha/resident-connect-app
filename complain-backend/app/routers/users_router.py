# app/routers/users_router.py
from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_db, require_admin, get_current_user
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from typing import List

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_users_me(
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    updated_user = crud.update_user_profile(db, user_id=current_user.id, user_in=user_in)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.get("/", response_model=List[schemas.UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    # Scope users to the admin's apartment
    apt_id = getattr(admin, 'apartment_id', None)
    if apt_id:
        return crud.list_users_for_apartment(db, apartment_id=apt_id, skip=skip, limit=limit)
    # fallback: return all users if admin not associated with an apartment
    return crud.list_users(db, skip=skip, limit=limit)

@router.put("/{user_id}/role", response_model=schemas.UserOut)
def change_role(user_id: int, role: schemas.RoleStr, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    updated = crud.update_user_role(db, user_id, role.value)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.put("/{user_id}/flat", response_model=schemas.UserOut)
def update_flat(user_id: int, payload: dict, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    flat = payload.get("flat")
    updated = crud.update_user_flat(db, user_id, flat)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.post("/invite")
def invite_user(payload: dict, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    
    email = payload.get("email")
    name = payload.get("name")
    role = payload.get("role", "user")

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    existing = crud.get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Generate a random password
    import secrets
    password = secrets.token_urlsafe(8)

    user_in = schemas.UserCreate(email=email, name=name, password=password)
    user = crud.create_user(db, user_in, role=role)

    # For now, return the generated password (later you can email it)
    return {
        "msg": "User invited successfully (password returned for now, send via email in production).",
        "user_id": user.id,
        "generated_password": password,
        "role": user.role.value
    }


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

