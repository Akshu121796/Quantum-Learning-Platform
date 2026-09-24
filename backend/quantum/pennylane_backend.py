import time
from collections import Counter

import pennylane as qml

from models.circuit import CircuitRequest, SimulationResult
from quantum.base import QuantumBackend


class PennyLaneBackend(QuantumBackend):
    name = "pennylane"

    def run(self, circuit: CircuitRequest) -> SimulationResult:
        start_time = time.perf_counter()

        dev = qml.device(
            "default.qubit",
            wires=circuit.qubits,
        )

        @qml.qnode(dev, shots=circuit.shots)
        def quantum_circuit():
            for gate in circuit.gates:
                self._apply_gate(gate)

            return qml.sample(wires=range(circuit.qubits))

        samples = quantum_circuit()

        counts = self._samples_to_counts(
            samples,
            circuit.qubits,
        )

        probabilities = {
            state: round(count / circuit.shots, 4)
            for state, count in counts.items()
        }

        execution_time_ms = round(
            (time.perf_counter() - start_time) * 1000,
            3,
        )

        return SimulationResult(
            backend=self.name,
            shots=circuit.shots,
            counts=counts,
            probabilities=probabilities,
            execution_time_ms=execution_time_ms,
        )

    @staticmethod
    def _apply_gate(gate):
        gate_type = gate.type

        if gate_type == "H":
            qml.Hadamard(wires=gate.targets[0])

        elif gate_type == "X":
            qml.PauliX(wires=gate.targets[0])

        elif gate_type == "Y":
            qml.PauliY(wires=gate.targets[0])

        elif gate_type == "Z":
            qml.PauliZ(wires=gate.targets[0])

        elif gate_type == "S":
            qml.S(wires=gate.targets[0])

        elif gate_type == "T":
            qml.T(wires=gate.targets[0])

        elif gate_type == "CX":
            if len(gate.targets) != 2:
                raise ValueError("CX gate requires two target qubits")

            qml.CNOT(wires=gate.targets)

        elif gate_type == "SWAP":
            if len(gate.targets) != 2:
                raise ValueError("SWAP gate requires two target qubits")

            qml.SWAP(wires=gate.targets)

        elif gate_type == "M":
            return

        else:
            raise ValueError(f"Unsupported gate: {gate_type}")

    @staticmethod
    def _samples_to_counts(samples, num_qubits: int) -> dict[str, int]:
        counts = Counter()

        for sample in samples:
            bit_string = "".join(
                str(int(bit))
                for bit in sample
            )
            counts[bit_string] += 1

        return dict(sorted(counts.items()))