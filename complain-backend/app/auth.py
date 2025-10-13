# # from fastapi import APIRouter, Depends, HTTPException
# # from fastapi.security import OAuth2PasswordRequestForm
# # from sqlalchemy.orm import Session
# # from . import crud, utils
# # from .deps import get_db
# # from .schemas import Token

# # router = APIRouter(prefix="/api/auth", tags=["auth"])

# # @router.post("/token", response_model=Token)
# # def login_for_access_token(
# #     form_data: OAuth2PasswordRequestForm = Depends(),
# #     db: Session = Depends(get_db)
# # ):
# #     user = crud.get_user_by_email(db, email=form_data.username)
# #     if not user or not utils.verify_password(form_data.password, user.hashed_password):
# #         raise HTTPException(status_code=400, detail="Incorrect username or password")

# #     access_token = utils.create_access_token(data={"sub": user.email})
    
# #     return {
# #         "access_token": access_token,
# #         "token_type": "bearer",
# #         "role": user.role.value
# #     }
# # @router.post("/forgot-password")
# # def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
# #     user = db.query(models.User).filter(models.User.email == request.email).first()
# #     if not user:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     token = secrets.token_urlsafe(32)
# #     reset_tokens[token] = {"email": request.email, "expires": datetime.utcnow() + timedelta(minutes=15)}

# #     reset_link = f"http://localhost:3000/reset-password?token={token}"
# #     background_tasks.add_task(print, f"Password reset link: {reset_link}")

# #     return {"message": "Password reset link sent"}


# from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# from pydantic import BaseModel
# import secrets

# from . import crud, utils, models
# from .deps import get_db
# from .schemas import Token

# router = APIRouter(prefix="/api/auth", tags=["auth"])

# # -------------------- LOGIN -------------------- #
# @router.post("/token", response_model=Token)
# def login_for_access_token(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: Session = Depends(get_db)
# ):
#     user = crud.get_user_by_email(db, email=form_data.username)
#     if not user or not utils.verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=400, detail="Incorrect username or password")

#     access_token = utils.create_access_token(data={"sub": user.email})
    
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "role": user.role.value
#     }


# # -------------------- FORGOT PASSWORD -------------------- #

# # temporary token store (for demo)
# reset_tokens = {}

# # request model
# class ForgotPasswordRequest(BaseModel):
#     email: str

# @router.post("/forgot-password")
# def forgot_password(
#     request: ForgotPasswordRequest,
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db)
# ):
#     user = db.query(models.User).filter(models.User.email == request.email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     # generate a secure token
#     token = secrets.token_urlsafe(32)
#     reset_tokens[token] = {
#         "email": request.email,
#         "expires": datetime.utcnow() + timedelta(minutes=15)
#     }

#     # generate a reset link (frontend will handle this route)
#     reset_link = f"http://localhost:3000/reset-password?token={token}"

#     # simulate sending email (for now, print link in terminal)
#     background_tasks.add_task(print, f"Password reset link: {reset_link}")

#     return {"message": "Password reset link sent"}
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import secrets

from . import models
from .deps import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Temporary token store (for demo)
reset_tokens = {}

# Request model
class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Debug: check incoming request
    print("Received request:", request)
    print("Received JSON body:", request)


    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a secure token
    token = secrets.token_urlsafe(32)
    reset_tokens[token] = {
        "email": request.email,
        "expires": datetime.utcnow() + timedelta(minutes=15)
    }

    # Generate reset link (frontend will handle /reset-password route)
    reset_link = f"http://localhost:3000/reset-password?token={token}"

    # Simulate sending email (print link in terminal)
    background_tasks.add_task(print, f"Password reset link: {reset_link}")

    return {"message": "Password reset link sent"}
