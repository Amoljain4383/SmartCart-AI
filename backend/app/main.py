from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.models import User
from app.routers import admin, auth, products

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="SmartCart AI product comparison MVP"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(admin.router)


@app.get("/")
def home():
    return {"message": "Welcome to SmartCart AI", "status": "running"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "database": "connected", "mode": "demo-catalogue"}
