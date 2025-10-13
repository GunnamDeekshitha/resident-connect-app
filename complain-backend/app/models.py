
# app/models.py
from sqlalchemy import Column, Integer, String, Enum, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum
import secrets

class Apartment(Base):
    __tablename__ = "apartments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    address = Column(String(255), nullable=True)
    access_code = Column(String(20), unique=True, nullable=False, default=lambda: secrets.token_hex(3))

    users = relationship("User", back_populates="apartment")

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class ComplaintStatus(str, enum.Enum):
    pending = "pending"
    inprogress = "inprogress"
    resolved = "resolved"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    flat = Column(String(80), nullable=True)
    apartment_id = Column(Integer, ForeignKey("apartments.id"), nullable=True)
    apartment = relationship("Apartment", back_populates="users")

    complaints = relationship("Complaint", back_populates="user", cascade="all, delete-orphan")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.pending, nullable=False)
    priority = Column(String(20), default="Medium")
    category = Column(String(80), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="complaints")
