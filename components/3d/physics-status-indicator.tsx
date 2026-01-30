"use client"

import { Html } from "@react-three/drei"
import { useOptimizationStore } from "@/store/optimization-store"
import { useTruckPhysics } from "@/physics/truck-physics-system"

export function PhysicsStatusIndicator() {
    const { isSimulationRunning, simulationForces } = useOptimizationStore()
    const truckPhysics = useTruckPhysics()

    if (!isSimulationRunning) return null

    return (
        <Html position={[-12, 6, 0]} className="pointer-events-none">
            <div className="bg-red-900/95 text-white p-3 rounded text-xs font-mono border border-red-600 shadow-xl backdrop-blur-sm">
                <div className="text-red-300 font-bold mb-2">🚛 TRUCK SIMULATION</div>

                {truckPhysics.isAccelerating && (
                    <div className="text-green-400">⬆️ ACCELERATING ({simulationForces.acceleration}g)</div>
                )}
                {truckPhysics.isBraking && (
                    <div className="text-red-400">⬇️ BRAKING ({simulationForces.braking}g)</div>
                )}
                {truckPhysics.isTurning && (
                    <div className="text-yellow-400">
                        {truckPhysics.turnDirection < 0 ? "⬅️" : "➡️"} TURNING ({simulationForces.turning}g)
                    </div>
                )}

                <div className="text-gray-300 mt-2">
                    Gravity: {simulationForces.gravity}g
                </div>
            </div>
        </Html>
    )
}
