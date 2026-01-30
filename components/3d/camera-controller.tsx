"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useOptimizationStore } from "@/store/optimization-store"

export function CameraController() {
    const { truckDimensions } = useOptimizationStore()
    const { gl } = useThree()

    // Ensure we have a DOM element to attach controls to
    if (!gl.domElement) return null

    return (
        <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={8}
            maxDistance={60}
            panSpeed={1.2}
            rotateSpeed={0.8}
            zoomSpeed={1.5}
            target={[0, truckDimensions.height / 2, 0]}
            enableDamping={true}
            dampingFactor={0.05}
        />
    )
}
