import time
from collections import Counter

import cirq

from models.circuit import CircuitRequest, SimulationResult
from quantum.base import QuantumBackend


class CirqBackend(QuantumBackend):
    name = "cirq"

    def run(self, circuit: CircuitRequest) -> SimulationResult:
        start_time = time.perf_counter()

        qubits = cirq.LineQubit.range(circuit.qubits)
        operations = []

        for gate in circuit.gates:
            operation = self._create_operation(gate, qubits)

            if operation is not None:
                operations.append(operation)

        # Add one final measurement for all qubits.
        operations.append(
            cirq.measure(*qubits, key="result")
        )

        quantum_circuit = cirq.Circuit(operations)

        simulator = cirq.Simulator()

        result = simulator.run(
            quantum_circuit,
            repetitions=circuit.shots,
        )

        measurements = result.measurements["result"]

        counts = Counter()

        for measurement in measurements:
            bit_string = "".join(
                str(int(bit))
                for bit in measurement
            )
            counts[bit_string] += 1

        counts = dict(sorted(counts.items()))

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
    def _create_operation(gate, qubits):
        gate_type = gate.type

        if gate_type == "H":
            return cirq.H(qubits[gate.targets[0]])

        elif gate_type == "X":
            return cirq.X(qubits[gate.targets[0]])

        elif gate_type == "Y":
            return cirq.Y(qubits[gate.targets[0]])

        elif gate_type == "Z":
            return cirq.Z(qubits[gate.targets[0]])

        elif gate_type == "S":
            return cirq.S(qubits[gate.targets[0]])

        elif gate_type == "T":
            return cirq.T(qubits[gate.targets[0]])

        elif gate_type == "CX":
            if len(gate.targets) != 2:
                raise ValueError(
                    "CX gate requires two target qubits"
                )

            return cirq.CNOT(
                qubits[gate.targets[0]],
                qubits[gate.targets[1]],
            )

        elif gate_type == "SWAP":
            if len(gate.targets) != 2:
                raise ValueError(
                    "SWAP gate requires two target qubits"
                )

            return cirq.SWAP(
                qubits[gate.targets[0]],
                qubits[gate.targets[1]],
            )

        elif gate_type == "M":
            # Measurement is added once at the end.
            return None

        else:
            raise ValueError(
                f"Unsupported gate: {gate_type}"
            )