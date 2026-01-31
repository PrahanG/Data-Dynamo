"use client"

import { useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { useOptimizationStore } from "@/store/optimization-store"

export function PerformanceStats() {
    const [fps, setFps] = useState(0)
    const [frameCount, setFrameCount] = useState(0)
    const [renderTime, setRenderTime] = useState(0)
    const [physicsObjects, setPhysicsObjects] = useState(0)
    const lastTime = useRef(performance.now())
    const frameStart = useRef(0)
    const { boxes, isSimulationRunning, optimizeLayout } = useOptimizationStore()

    const handleOptimize = () => {
        console.log('🔄 Optimize button clicked from PerformanceStats')
        optimizeLayout()
    }

    useFrame(() => {
        const currentTime = performance.now()
        frameStart.current = currentTime

        setFrameCount((prev) => prev + 1)
        setPhysicsObjects(boxes.length)

        if (currentTime - lastTime.current >= 1000) {
            setFps(frameCount)
            setFrameCount(0)
            lastTime.current = currentTime
        }

        requestAnimationFrame(() => {
            setRenderTime(performance.now() - frameStart.current)
        })
    })

    return (
        <Html position={[12, 8, 0]} className="pointer-events-auto">
            <div className="bg-black/90 text-white p-3 rounded text-xs font-mono border border-gray-600">
                <div className={`${fps > 60 ? "text-green-400" : fps > 30 ? "text-yellow-400" : "text-red-400"}`}>
                    FPS: {fps}
                </div>

                <div className="text-cyan-400">Render: {renderTime.toFixed(2)}ms</div>
                <div className="text-blue-400">Physics Objects: {physicsObjects}</div>
                <div className={`${isSimulationRunning ? "text-green-400" : "text-gray-400"}`}>
                    Physics: {isSimulationRunning ? "ACTIVE" : "IDLE"}
                </div>
                <div className="text-gray-400">WebGL 2.0</div>
            </div>
        </Html>
    )
}
