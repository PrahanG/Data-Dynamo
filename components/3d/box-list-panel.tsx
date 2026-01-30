"use client"

import { useState, useMemo } from "react"
import { useOptimizationStore } from "@/store/optimization-store"
import { setGlobalSelectedBox, globalSelectCallbacks } from "@/utils/visualization-state"
import type { SelectedBoxInfo } from "@/types/visualization-types"

interface BoxListPanelProps {
    minimized?: boolean
    onToggle?: () => void
    className?: string
}

export function BoxListPanel({ minimized = false, onToggle, className = "" }: BoxListPanelProps) {
    const { boxes, focusedBoxId, setFocusedBoxId, isIsolationMode, setIsIsolationMode } = useOptimizationStore()
    const [internalExpanded, setInternalExpanded] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const isExpanded = onToggle ? !minimized : internalExpanded
    const handleToggle = onToggle || (() => setInternalExpanded(prev => !prev))

    // Filter boxes based on search query
    const filteredBoxes = useMemo(() => {
        if (!searchQuery.trim()) return boxes
        const lowerQuery = searchQuery.toLowerCase()
        return boxes.filter(box =>
            box.id.toString().toLowerCase().includes(lowerQuery) ||
            (box.name && box.name.toLowerCase().includes(lowerQuery))
        )
    }, [boxes, searchQuery])

    const handleBoxClick = (box: any) => {
        const selectedInfo: SelectedBoxInfo = {
            id: box.id,
            name: box.name,
            position: box.position,
            rotation: { x: 0, y: 0, z: 0 },
            isRotated: box.isRotated || false
        }

        // Update focus and global selection
        setFocusedBoxId(box.id)
        setGlobalSelectedBox(selectedInfo)

        // Notify other components
        globalSelectCallbacks.forEach(cb => cb(selectedInfo))
    }

    const clearSelection = () => {
        setFocusedBoxId(null)
        setGlobalSelectedBox(null)
        globalSelectCallbacks.forEach(cb => cb(null))
    }

    return (
        <div className={`${className} ${!className.includes('absolute') ? 'absolute top-24 right-4' : ''} z-20 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-auto'}`}>
            {!isExpanded ? (
                <div className="">
                    <button
                        onClick={handleToggle}
                        className="bg-gray-900/90 text-white p-3 rounded-lg border border-gray-600 shadow-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                        title="Show Box List"
                    >
                        <span className="text-xl">📦</span>
                        <span className="font-semibold text-sm hidden md:block">Boxes</span>
                    </button>
                </div>
            ) : (
                <div className="w-full bg-gray-900/95 text-white rounded-lg border border-gray-600 shadow-xl backdrop-blur-sm max-h-[70vh] flex flex-col transition-all duration-300">
                    {/* Header */}
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📦</span>
                            <h3 className="font-semibold text-sm text-cyan-400">Inventory</h3>
                            <span className="bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-300">
                                {filteredBoxes.length}
                            </span>
                        </div>
                        <button
                            onClick={handleToggle}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                            —
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-gray-700 bg-gray-800/30">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search boxes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 placeholder-gray-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1.5 text-gray-500 hover:text-white"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredBoxes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No boxes found
                            </div>
                        ) : (
                            filteredBoxes.map((box) => {
                                const isSelected = focusedBoxId === box.id
                                return (
                                    <button
                                        key={box.id}
                                        onClick={() => handleBoxClick(box)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-all duration-200 border border-transparent ${isSelected
                                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-input'
                                            : 'hover:bg-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className={`font-mono ${isSelected ? 'text-blue-200 font-bold' : ''}`}>
                                                {box.id}
                                            </span>
                                            {box.isFragile && <span title="Fragile">⚠️</span>}
                                        </div>
                                        {box.name && (
                                            <div className={`text-xs truncate ${isSelected ? 'text-blue-300' : 'text-gray-500'}`}>
                                                {box.name}
                                            </div>
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {focusedBoxId && (
                        <div className="p-3 border-t border-gray-700 bg-gray-800/50 space-y-2">
                            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white">
                                <input
                                    type="checkbox"
                                    checked={isIsolationMode}
                                    onChange={(e) => setIsIsolationMode(e.target.checked)}
                                    className="rounded bg-gray-700 border-gray-600 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-800"
                                />
                                <span>Isolate selected box (X-Ray)</span>
                            </label>

                            <button
                                onClick={clearSelection}
                                className="w-full py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
