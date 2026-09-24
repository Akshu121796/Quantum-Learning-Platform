from models.circuit import CircuitRequest, Gate
from quantum.pennylane_backend import PennyLaneBackend


circuit = CircuitRequest(
    backend="pennylane",
    qubits=2,
    shots=1000,
    gates=[
        Gate(type="H", targets=[0]),
        Gate(type="CX", targets=[0, 1]),
    ],
)

result = PennyLaneBackend().run(circuit)

print("Backend:", result.backend)
print("Shots:", result.shots)
print("Counts:", result.counts)
print("Probabilities:", result.probabilities)
print("Execution time:", result.execution_time_ms, "ms")