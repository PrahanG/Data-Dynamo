"use client"

import { useOptimizationStore } from "@/store/optimization-store"
import { useRouteStore } from "@/store/route-store"
import type { HoveredBoxInfo } from "@/types/visualization-types"

// Enhanced Box Tooltip Component with Route Info
export function BoxTooltip({ hoveredBox }: { hoveredBox: HoveredBoxInfo | null }) {
    const { isSimulationRunning } = useOptimizationStore()
    const { deliveryStops } = useRouteStore()

    if (!hoveredBox || isSimulationRunning) return null

    const getDestinationInfo = (destination: string) => {
        const stop = deliveryStops.find(s => s.name === destination)
        return {
            color: stop ? (stop.isCompleted ? 'text-green-400' : 'text-blue-400') : 'text-gray-400',
            status: stop ? (stop.isCompleted ? '✓ Completed' : '🚛 Pending') : '❌ Invalid'
        }
    }

    const destInfo = hoveredBox.destination ? getDestinationInfo(hoveredBox.destination) : null

    return (
        <div
            className="fixed pointer-events-none z-50 bg-gray-900/95 text-white p-3 rounded-lg border border-gray-600 shadow-xl backdrop-blur-sm"
            style={{
                left: hoveredBox.screenPosition.x + 15,
                top: hoveredBox.screenPosition.y - 10,
                transform: 'translateY(-100%)'
            }}
        >
            <div className="text-sm font-semibold text-cyan-400 mb-2">{hoveredBox.name}</div>

            <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">ID:</span>
                    <span className="text-white font-mono">{hoveredBox.id}</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Dimensions:</span>
                    <span className="text-white font-mono">
                        {hoveredBox.dimensions.width}×{hoveredBox.dimensions.height}×{hoveredBox.dimensions.length} ft
                    </span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Weight:</span>
                    <span className="text-white font-mono">{hoveredBox.weight} lbs</span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Position:</span>
                    <span className="text-white font-mono">
                        X:{hoveredBox.position.x.toFixed(1)}, Y:{hoveredBox.position.y.toFixed(1)}, Z:{hoveredBox.position.z.toFixed(1)}
                    </span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Temperature:</span>
                    <span className={`font-medium ${hoveredBox.temperatureZone === 'frozen' ? 'text-blue-400' :
                        hoveredBox.temperatureZone === 'cold' ? 'text-cyan-400' : 'text-green-400'
                        }`}>
                        {hoveredBox.temperatureZone.toUpperCase()}
                    </span>
                </div>

                {/* Enhanced Destination Info */}
                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Destination:</span>
                    {hoveredBox.destination ? (
                        <div className="text-right">
                            <div className={`font-medium ${destInfo?.color}`}>
                                {hoveredBox.destination}
                            </div>
                            <div className={`text-xs ${destInfo?.color}`}>
                                {destInfo?.status}
                            </div>
                        </div>
                    ) : (
                        <span className="text-orange-400 font-medium">⚠️ UNASSIGNED</span>
                    )}
                </div>

                {hoveredBox.isFragile && (
                    <div className="flex justify-between gap-3">
                        <span className="text-gray-300">Special:</span>
                        <span className="text-red-400 font-medium">⚠️ FRAGILE</span>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-700 space-y-1 text-xs">
                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Volume:</span>
                    <span className="text-white font-mono">
                        {(hoveredBox.dimensions.width * hoveredBox.dimensions.height * hoveredBox.dimensions.length).toFixed(1)} ft³
                    </span>
                </div>

                <div className="flex justify-between gap-3">
                    <span className="text-gray-300">Density:</span>
                    <span className="text-white font-mono">
                        {(hoveredBox.weight / (hoveredBox.dimensions.width * hoveredBox.dimensions.height * hoveredBox.dimensions.length)).toFixed(1)} lbs/ft³
                    </span>
                </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                💡 Click to select • Assign destination in Route Stops tab
            </div>
        </div>
    )
}
