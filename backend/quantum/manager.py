from models.circuit import CircuitRequest, SimulationResult

from quantum.base import QuantumBackend
from quantum.cirq_backend import CirqBackend
from quantum.pennylane_backend import PennyLaneBackend
from quantum.qiskit_backend import QiskitBackend


class BackendManager:
    """Selects and executes the requested quantum simulation backend."""

    def __init__(self):
        self.backends: dict[str, QuantumBackend] = {
            "qiskit_aer": QiskitBackend(),
            "pennylane": PennyLaneBackend(),
            "cirq": CirqBackend(),
        }

    def run(self, circuit: CircuitRequest) -> SimulationResult:
        backend_name = circuit.backend

        backend = self.backends.get(backend_name)

        if backend is None:
            available = ", ".join(self.backends.keys())
            raise ValueError(
                f"Unsupported backend '{backend_name}'. "
                f"Available backends: {available}"
            )

        return backend.run(circuit)

    def available_backends(self) -> list[str]:
        return list(self.backends.keys())