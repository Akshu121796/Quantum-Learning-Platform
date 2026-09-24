from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.simulation import router as simulation_router


app = FastAPI(
    title="Quantum Learning Platform API",
    description="Quantum circuit simulation and learning backend",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Quantum Learning Platform API is running",
        "status": "success",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "quantum-backend",
    }


app.include_router(simulation_router)