# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
import os
from dotenv import load_dotenv

# Load environment variables early so modules (deps/utils) can read them on import
load_dotenv()

from .routers.auth_router import router as auth_router
from .routers.complaints_router import router as complaints_router
from .routers.users_router import router as users_router
from .routers.apartment_router import router as apartment_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResidentConnect API")

# CORS
origins = [os.getenv("FRONTEND_URL", "http://localhost:3000")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins.split(",") if "," in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(users_router)
app.include_router(apartment_router)
