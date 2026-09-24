from fastapi import APIRouter, HTTPException

from models.circuit import CircuitRequest, SimulationResult
from quantum.manager import BackendManager


router = APIRouter(prefix="/api", tags=["Quantum Simulation"])

manager = BackendManager()


@router.post("/simulate", response_model=SimulationResult)
def simulate_circuit(circuit: CircuitRequest):
    try:
        return manager.run(circuit)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {exc}",
        )