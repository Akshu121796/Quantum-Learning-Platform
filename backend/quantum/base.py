from abc import ABC, abstractmethod

from models.circuit import CircuitRequest, SimulationResult


class QuantumBackend(ABC):
    """Common interface for all quantum simulation backends."""

    name: str

    @abstractmethod
    def run(self, circuit: CircuitRequest) -> SimulationResult:
        """Execute a circuit and return standardized results."""
        raise NotImplementedError