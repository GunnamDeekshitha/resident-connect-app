# app/routers/complaints_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud, models
from ..deps import get_db, get_current_user, require_admin

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

@router.post("/", response_model=schemas.ComplaintOut)
def create_complaint(complaint_in: schemas.ComplaintCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comp = crud.create_complaint(db, user_id=current_user.id, complaint_in=complaint_in)
    return comp

@router.get("/me", response_model=List[schemas.ComplaintOut])
def get_my_complaints(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.list_complaints_for_user(db, user_id=current_user.id)


@router.get("/apartment/recent", response_model=List[schemas.ComplaintOut])
def get_recent_apartment_complaints(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # require the user to be part of an apartment
    if not current_user.apartment_id:
        return []
    return crud.list_complaints_for_apartment(db, apartment_id=current_user.apartment_id, limit=5)


@router.get("/apartment/counts")
def get_apartment_complaint_counts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.apartment_id:
        return {"total": 0, "pending": 0, "inprogress": 0, "resolved": 0}
    return crud.complaint_counts_for_apartment(db, apartment_id=current_user.apartment_id)

@router.get("/", response_model=List[schemas.ComplaintOut])
def get_all_complaints(skip: int = 0, limit: int = 100, status: str = Query(None), search: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    # return complaints only for the admin's apartment
    apt_id = getattr(admin, 'apartment_id', None)
    if apt_id:
        return crud.list_all_complaints_for_apartment(db, apartment_id=apt_id, skip=skip, limit=limit, status=status, search=search)
    return crud.list_all_complaints(db, skip=skip, limit=limit, status=status, search=search)

@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint(complaint_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comp = crud.get_complaint(db, complaint_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    # If admin, ensure complaint belongs to admin's apartment
    if current_user.role == models.UserRole.admin:
        if not current_user.apartment_id or comp.user and comp.user.apartment_id != current_user.apartment_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif comp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return comp

@router.put("/{complaint_id}", response_model=schemas.ComplaintOut)
def update_complaint(complaint_id: int, updates: schemas.ComplaintUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comp = crud.get_complaint(db, complaint_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Admin can update status etc.
    if current_user.role == models.UserRole.admin:
        allowed = {k: v for k, v in updates.dict().items() if v is not None}
        # verify admin has permission for this complaint
        if not current_user.apartment_id or comp.user and comp.user.apartment_id != current_user.apartment_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        comp = crud.update_complaint(db, comp, allowed)
        if comp is None:
            raise HTTPException(status_code=400, detail="Invalid status value")
        return comp

    # Regular user: only allow changes to own complaint and only if still pending
    if comp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if comp.status != models.ComplaintStatus.pending:
        raise HTTPException(status_code=400, detail="Cannot edit complaint once processed")
    allowed = {}
    for k, v in updates.dict().items():
        if v is not None and k in ("title", "description", "category", "priority"):
            allowed[k] = v
    comp = crud.update_complaint(db, comp, allowed)
    if comp is None:
        raise HTTPException(status_code=400, detail="Invalid status value")
    return comp

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    comp = crud.get_complaint(db, complaint_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    # ensure admin belongs to same apartment
    if not admin.apartment_id or comp.user and comp.user.apartment_id != admin.apartment_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    crud.delete_complaint(db, comp)
    return {"msg": "Complaint deleted"}
