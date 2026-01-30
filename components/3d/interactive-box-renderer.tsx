"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { BoxGeometry, Mesh, Group } from "three"
import { useOptimizationStore } from "@/store/optimization-store"
import { useRouteStore } from "@/store/route-store"
import type { HoveredBoxInfo, SelectedBoxInfo } from "@/types/visualization-types"
import {
    globalSelectCallbacks,
    globalHoverCallbacks,
    setGlobalHoveredBox,
    setGlobalSelectedBox,
    globalHoveredBox as getGlobalHoveredBox // Just to check if we need to read it?
    // Actually we need to set it, so setGlobalHoveredBox is what we need. 
    // But wait, in the original code: globalHoveredBox = hoveredInfo
    // And in handlePointerMove: if (globalHoveredBox) ...
    // So we do need to read it too.
} from "@/utils/visualization-state"

import { globalHoveredBox } from "@/utils/visualization-state" // Import for reading

// Enhanced Interactive Box Renderer with Route-based Colors
export function InteractiveBoxRenderer({ box }: { box: any }) {
    const { focusedBoxId, isIsolationMode } = useOptimizationStore()
    const meshRef = useRef<Mesh>(null)
    const groupRef = useRef<Group>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isSelected, setIsSelected] = useState(false)
    const [localPosition, setLocalPosition] = useState(box.position)
    const [localRotation, setLocalRotation] = useState(box.isRotated || false)
    const { isSimulationRunning } = useOptimizationStore()
    const { deliveryStops } = useRouteStore()

    useEffect(() => {
        const checkSelection = (selectedBox: SelectedBoxInfo | null) => {
            const selected = selectedBox?.id === box.id
            setIsSelected(selected)

            if (selected && selectedBox) {
                setLocalPosition(selectedBox.position)
                setLocalRotation(selectedBox.isRotated || false)
            }
        }

        if (globalSelectCallbacks) {
            globalSelectCallbacks.add(checkSelection)
        }

        return () => {
            if (globalSelectCallbacks) {
                globalSelectCallbacks.delete(checkSelection)
            }
        }
    }, [box.id])

    useEffect(() => {
        const threshold = 0.1
        if (Math.abs(localPosition.x - box.position.x) > threshold ||
            Math.abs(localPosition.y - box.position.y) > threshold ||
            Math.abs(localPosition.z - box.position.z) > threshold) {
            setLocalPosition(box.position)
        }
    }, [box.position])

    useFrame(() => {
        if (groupRef.current && (isSelected || localPosition !== box.position)) {
            groupRef.current.position.set(localPosition.x, localPosition.y, localPosition.z)
            groupRef.current.rotation.y = localRotation ? Math.PI / 2 : 0
        }
    })

    const handlePointerEnter = useCallback((event: any) => {
        if (isSimulationRunning) return
        event.stopPropagation()
        setIsHovered(true)

        const screenPosition = {
            x: event.clientX || event.nativeEvent?.clientX || 0,
            y: event.clientY || event.nativeEvent?.clientY || 0
        }

        const hoveredInfo: HoveredBoxInfo = {
            id: box.id,
            name: box.name,
            position: localPosition,
            dimensions: { width: box.width, height: box.height, length: box.length },
            weight: box.weight,
            isFragile: box.isFragile,
            temperatureZone: box.temperatureZone,
            destination: box.destination,
            screenPosition
        }

        setGlobalHoveredBox(hoveredInfo)
        globalHoverCallbacks.forEach(callback => callback(hoveredInfo))
    }, [box, localPosition, isSimulationRunning])

    const handlePointerLeave = useCallback((event: any) => {
        if (isSimulationRunning) return
        event.stopPropagation()
        setIsHovered(false)
        setGlobalHoveredBox(null)
        globalHoverCallbacks.forEach(callback => callback(null))
    }, [isSimulationRunning])

    const handlePointerMove = useCallback((event: any) => {
        if (!isHovered || isSimulationRunning) return

        const screenPosition = {
            x: event.clientX || event.nativeEvent?.clientX || 0,
            y: event.clientY || event.nativeEvent?.clientY || 0
        }

        if (globalHoveredBox) {
            globalHoveredBox.screenPosition = screenPosition
            globalHoverCallbacks.forEach(callback => callback(globalHoveredBox))
        }
    }, [isHovered, isSimulationRunning])

    const handleClick = useCallback((event: any) => {
        if (isSimulationRunning) return
        event.stopPropagation()

        const selectedInfo: SelectedBoxInfo = {
            id: box.id,
            name: box.name,
            position: localPosition,
            rotation: { x: 0, y: localRotation ? Math.PI / 2 : 0, z: 0 },
            isRotated: localRotation
        }

        setGlobalSelectedBox(selectedInfo)
        globalSelectCallbacks.forEach(callback => callback(selectedInfo))
    }, [box, localPosition, localRotation, isSimulationRunning])

    // Enhanced color logic based on destination
    const getBoxColor = (box: any) => {
        // Priority: Destination > Fragile > Temperature
        if (box.destination) {
            const stopIndex = deliveryStops.findIndex(stop => stop.name === box.destination)
            const colors = ["#d63031", "#e17055", "#00b894", "#0984e3", "#fdcb6e", "#6c5ce7"]
            return colors[stopIndex % colors.length] || "#2d3436"
        }
        if (box.isFragile) return "#d63031"
        switch (box.temperatureZone) {
            case "frozen": return "#0984e3"
            case "cold": return "#6c5ce7"
            default: return "#00b894"
        }
    }

    const isFocused = focusedBoxId === box.id || isSelected
    const isHidden = isIsolationMode && focusedBoxId && !isFocused

    const getBoxOpacity = (box: any) => {
        // Debug log for specific box
        // if (focusedBoxId) console.log(`Box ${box.id}: isHidden=${isHidden}, opacity=${isHidden ? 0 : (box.isNew ? 0.7 : 1.0)}`);
        if (isHidden) return 0
        return box.isNew ? 0.7 : 1.0
    }

    return (
        <group
            ref={groupRef}
            position={[localPosition.x, localPosition.y, localPosition.z]}
            visible={!isHidden} // Check this: if invisible, children won't render or interact
        >
            {/* Main Box Mesh */}
            <mesh
                ref={meshRef}
                rotation={[0, localRotation ? Math.PI / 2 : 0, 0]}
                onPointerEnter={isHidden ? undefined : handlePointerEnter} // Double safety
                onPointerLeave={isHidden ? undefined : handlePointerLeave}
                onPointerMove={isHidden ? undefined : handlePointerMove}
                onClick={isHidden ? undefined : handleClick}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[box.width, box.height, box.length]} />
                <meshStandardMaterial
                    color={getBoxColor(box)}
                    transparent={box.isNew || (isIsolationMode && !!focusedBoxId)}
                    opacity={getBoxOpacity(box)}
                    roughness={isHovered ? 0.2 : 0.4}
                    metalness={isHovered ? 0.3 : 0.1}
                    emissive={isFocused || isHovered ? "#ffffff" : "#111111"}
                    emissiveIntensity={isFocused ? 0.6 : isHovered ? 0.2 : 0.05}
                    envMapIntensity={0.8}
                />
            </mesh>

            {/* Borders */}
            <lineSegments rotation={[0, localRotation ? Math.PI / 2 : 0, 0]}>
                <edgesGeometry args={[new BoxGeometry(box.width, box.height, box.length) as any, 1]} />
                <lineBasicMaterial
                    color={isFocused ? "#ffffff" : "#000000"}
                    transparent={false}
                    opacity={1.0}
                    linewidth={isFocused ? 2 : 1}
                />
            </lineSegments>

            {/* Box ID/Name Text Background */}
            {/* Bold 3D Text Label - Visible from all angles */}
            {(isHovered || isSelected) && (
                <group position={[0, box.height / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    {/* White background card for readability */}
                    <mesh position={[0, 0, -0.01]}>
                        <planeGeometry args={[Math.min(box.width * 0.8, 1.5), Math.min(box.length * 0.8, 0.6)]} />
                        <meshBasicMaterial color="white" transparent opacity={0.9} />
                    </mesh>

                    {/* High contrast text */}
                    <Text
                        position={[0, 0, 0]}
                        fontSize={Math.min(box.width, box.length) * 0.6}
                        color="black"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.04}
                        outlineColor="white"
                        depthOffset={-1} // Helps prevent z-fighting
                        fontWeight="bold"
                    >
                        {box.id}
                    </Text>
                </group>
            )}

            {/* Corner Accent Dots */}
            {[
                [-box.width / 2, box.height / 2, -box.length / 2],
                [box.width / 2, box.height / 2, -box.length / 2],
                [-box.width / 2, box.height / 2, box.length / 2],
                [box.width / 2, box.height / 2, box.length / 2]
            ].map((pos, i) => (
                //@ts-ignore
                <mesh key={i} position={pos} rotation={[0, localRotation ? Math.PI / 2 : 0, 0]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial
                        color={isHovered ? "#ffffff" : getBoxColor(box)}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
        </group>
    )
}
