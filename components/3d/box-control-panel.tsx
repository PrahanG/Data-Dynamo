"use client"

import { useState, useEffect } from "react"
import { useOptimizationStore } from "@/store/optimization-store"
import type { SelectedBoxInfo } from "@/types/visualization-types"
import {
    globalSelectedBox,
    setGlobalSelectedBox,
    globalSelectCallbacks
} from "@/utils/visualization-state"

// Manual Box Control Panel
export function BoxControlPanel({ selectedBox }: { selectedBox: SelectedBoxInfo | null }) {
    const { updateBoxPosition, updateBox } = useOptimizationStore()
    const [localPosition, setLocalPosition] = useState({ x: 0, y: 0, z: 0 })
    const [localRotation, setLocalRotation] = useState(false)
    const { setFocusedBoxId } = useOptimizationStore()

    useEffect(() => {
        if (selectedBox) {
            setLocalPosition(selectedBox.position)
            setLocalRotation(selectedBox.isRotated || false)
        }
    }, [selectedBox?.id])

    if (!selectedBox) return null

    const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newPosition = { ...localPosition, [axis]: value }
        setLocalPosition(newPosition)

        updateBoxPosition(selectedBox.id, newPosition)

        if (globalSelectedBox) {
            // Direct mutation for performance - ensuring we are updating the global state reference object
            globalSelectedBox.position = newPosition
        }
    }

    const handleRotationToggle = () => {
        const newRotation = !localRotation
        setLocalRotation(newRotation)

        updateBox(selectedBox.id, {
            isRotated: newRotation,
        })

        if (globalSelectedBox) {
            globalSelectedBox.isRotated = newRotation
            globalSelectedBox.rotation.y = newRotation ? Math.PI / 2 : 0
        }
    }

    return (
        <div className="absolute top-20 right-4 z-10 bg-gray-900/95 text-white p-4 rounded-lg border border-gray-600 shadow-xl backdrop-blur-sm">
            <div className="text-sm font-semibold text-cyan-400 mb-3">Manual Control: {selectedBox.name}</div>

            <div className="space-y-3 text-xs">
                <div className="pb-2 border-b border-gray-700">
                    <label className="text-gray-300 block mb-2">Orientation:</label>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRotationToggle}
                            className={`px-3 py-1 rounded text-xs transition-colors ${!localRotation
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                        >
                            Horizontal
                        </button>
                        <button
                            onClick={handleRotationToggle}
                            className={`px-3 py-1 rounded text-xs transition-colors ${localRotation
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                        >
                            Vertical
                        </button>
                    </div>
                    <div className="text-gray-400 mt-1">
                        {localRotation ? "📦 Rotated 90°" : "📦 Default orientation"}
                    </div>
                </div>

                <div>
                    <label className="text-gray-300 block mb-1">Position X:</label>
                    <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.1}
                        value={localPosition.x}
                        onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white font-mono">{localPosition.x.toFixed(1)}</span>
                </div>

                <div>
                    <label className="text-gray-300 block mb-1">Position Y:</label>
                    <input
                        type="range"
                        min={0.5}
                        max={8}
                        step={0.1}
                        value={localPosition.y}
                        onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white font-mono">{localPosition.y.toFixed(1)}</span>
                </div>

                <div>
                    <label className="text-gray-300 block mb-1">Position Z:</label>
                    <input
                        type="range"
                        min={-14}
                        max={14}
                        step={0.1}
                        value={localPosition.z}
                        onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white font-mono">{localPosition.z.toFixed(1)}</span>
                </div>

                <div className="pt-2 border-t border-gray-700">
                    <button
                        onClick={() => {
                            setFocusedBoxId(null)
                            setGlobalSelectedBox(null)
                            globalSelectCallbacks.forEach(cb => cb(null))
                        }}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                        Deselect Box
                    </button>
                </div>
            </div>
        </div>
    )
}
