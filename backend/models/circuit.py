from typing import Literal

from pydantic import BaseModel, Field


GateType = Literal[
    "H",
    "X",
    "Y",
    "Z",
    "S",
    "T",
    "CX",
    "SWAP",
    "M",
]


class Gate(BaseModel):
    type: GateType
    targets: list[int] = Field(min_length=1, max_length=2)
    control: int | None = None


class CircuitRequest(BaseModel):
    backend: Literal[
        "qiskit_aer",
        "pennylane",
        "cirq",
    ] = "qiskit_aer"

    qubits: int = Field(default=2, ge=1, le=20)

    shots: int = Field(default=1000, ge=1, le=10000)

    gates: list[Gate] = Field(default_factory=list)


class SimulationResult(BaseModel):
    backend: str
    shots: int
    counts: dict[str, int]
    probabilities: dict[str, float]
    execution_time_ms: float