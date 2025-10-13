# # app/schemas.py
# from pydantic import BaseModel, EmailStr, Field
# from typing import Optional
# from enum import Enum

# class RoleStr(str, Enum):
#     user = "user"
#     admin = "admin"

# class UserBase(BaseModel):
#     email: EmailStr
#     name: Optional[str] = None

# class UserCreate(UserBase):
#     password: str = Field(..., max_length=72)

# class UserOut(UserBase):
#     id: int
#     role: RoleStr

#     class Config:
#         orm_mode = True
#         use_enum_values=True

# class Token(BaseModel):
#     access_token: str
#     token_type: str
#     role:Optional[RoleStr] = None
#     class Config:
#         use_enum_values=True

# class TokenData(BaseModel):
#     email: Optional[str] = None

# class ComplaintBase(BaseModel):
#     title: str
#     description: Optional[str] = None
#     category: Optional[str] = None
#     priority: Optional[str] = "Medium"

# class ComplaintCreate(ComplaintBase):
#     pass

# class ComplaintUpdate(BaseModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     status: Optional[str] = None
#     priority: Optional[str] = None
#     category: Optional[str] = None

# class ComplaintOut(ComplaintBase):
#     id: int
#     status: str
#     user_id: int

#     class Config:
#         orm_mode = True

# app/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class RoleStr(str, Enum):
    user = "user"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    flat: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., max_length=72)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    flat: Optional[str] = None

class UserSignup(UserCreate):
    access_code: Optional[str] = None
    flat: Optional[str] = None

class UserOut(UserBase):
    id: int
    role: RoleStr
    apartment_id: Optional[int] = None

    class Config:
        orm_mode = True
        use_enum_values = True


class Token(BaseModel):
    access_token: str
    token_type: str
    role: Optional[RoleStr] = None
    name: Optional[str] = None
    flat: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None

class ComplaintBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = "Medium"

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintOut(ComplaintBase):
    id: int
    status: str
    user_id: int
    user: Optional[UserOut] = None

    class Config:
        orm_mode = True

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None   # e.g., "open", "in_progress", "resolved"

    class Config:
        orm_mode = True

# --- Added for Apartment ---
class ApartmentBase(BaseModel):
    name: str
    address: Optional[str] = None

class ApartmentOut(ApartmentBase):
    id: int
    access_code: str
    class Config:
        orm_mode = True
