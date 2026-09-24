import time

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

from models.circuit import CircuitRequest, SimulationResult
from quantum.base import QuantumBackend


class QiskitBackend(QuantumBackend):
    name = "qiskit_aer"

    def __init__(self):
        self.simulator = AerSimulator()

    def run(self, circuit: CircuitRequest) -> SimulationResult:
        start_time = time.perf_counter()

        qc = QuantumCircuit(circuit.qubits, circuit.qubits)

        for gate in circuit.gates:
            self._apply_gate(qc, gate)

        qc.measure(range(circuit.qubits), range(circuit.qubits))

        result = self.simulator.run(
            qc,
            shots=circuit.shots,
        ).result()

        raw_counts = result.get_counts()

        counts = {
            state: int(count)
            for state, count in raw_counts.items()
        }

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
    def _apply_gate(qc: QuantumCircuit, gate):
        gate_type = gate.type

        if gate_type == "H":
            qc.h(gate.targets[0])

        elif gate_type == "X":
            qc.x(gate.targets[0])

        elif gate_type == "Y":
            qc.y(gate.targets[0])

        elif gate_type == "Z":
            qc.z(gate.targets[0])

        elif gate_type == "S":
            qc.s(gate.targets[0])

        elif gate_type == "T":
            qc.t(gate.targets[0])

        elif gate_type == "CX":
            if len(gate.targets) != 2:
                raise ValueError("CX gate requires two target qubits")

            qc.cx(
                gate.targets[0],
                gate.targets[1],
            )

        elif gate_type == "SWAP":
            if len(gate.targets) != 2:
                raise ValueError("SWAP gate requires two target qubits")

            qc.swap(
                gate.targets[0],
                gate.targets[1],
            )

        elif gate_type == "M":
            # Measurements are added automatically at the end.
            return

        else:
            raise ValueError(f"Unsupported gate: {gate_type}")