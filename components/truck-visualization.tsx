"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera, Html, Stats } from "@react-three/drei"
import { Physics } from "@react-three/cannon"
import { Suspense, useRef, useEffect, useState, useMemo } from "react"
import { TruckContainer } from "@/components/3d/truck-container"
import { TemperatureZones } from "@/components/3d/temperature-zones"
import { LoadingIndicators } from "@/components/3d/loading-indicators"
import { PhysicsDebugger } from "@/components/3d/physics-debugger"
import { TwoDRenderer } from "@/components/2d/two-d-renderer"
import { useOptimizationStore } from "@/store/optimization-store"
import {
  PhysicsSimulationController,
  EnhancedBoxRenderer,
  TruckBedPhysics,
} from "@/physics/truck-physics-system"

// Imported Components & Store
import { useRouteStore, ensureRouteStoreHasDefaults } from "@/store/route-store"
import { OrdersPanel } from "@/components/orders-panel"
import { BoxTooltip } from "@/components/3d/box-tooltip"
import { BoxControlPanel } from "@/components/3d/box-control-panel"
import { BoxListPanel } from "@/components/3d/box-list-panel"
import { InteractiveBoxRenderer } from "@/components/3d/interactive-box-renderer"
import { CameraController } from "@/components/3d/camera-controller"
import { PerformanceStats } from "@/components/3d/performance-stats"
import { PhysicsStatusIndicator } from "@/components/3d/physics-status-indicator"
import { StatusPanel } from "@/components/status-panel"


import {
  globalHoverCallbacks,
  globalSelectCallbacks,
  setGlobalHoveredBox,
  setGlobalSelectedBox
} from "@/utils/visualization-state"
import type { HoveredBoxInfo, SelectedBoxInfo } from "@/types/visualization-types"

interface TruckVisualizationProps {
  viewMode: "3d" | "2d" | "hybrid"
}

// Scene setup for 3D visualization
function Scene() {
  const { boxes, physicsEnabled, truckDimensions, updatePhysics, isSimulationRunning } = useOptimizationStore()

  const boxesKey = useMemo(() => {
    return boxes.map(b => `${b.id}-${b.position.x}-${b.position.y}-${b.position.z}`).join(',')
  }, [boxes])

  useEffect(() => {
    // console.log('📊 Scene updated with', boxes.length, 'boxes')
    updatePhysics()
  }, [boxes, updatePhysics])

  const boxRenderers = useMemo(() => {
    return boxes.map((box) => (
      isSimulationRunning ? (
        <EnhancedBoxRenderer key={`physics-${box.id}-${boxesKey}`} box={box} />
      ) : (
        <InteractiveBoxRenderer key={`interactive-${box.id}-${boxesKey}`} box={box} />
      )
    ))
  }, [boxes, boxesKey, isSimulationRunning])

  return (
    <>
      <PerspectiveCamera makeDefault position={[20, 15, 20]} fov={50} near={0.1} far={1000} />

      <CameraController />

      <Environment preset="city" />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <pointLight position={[0, 15, 0]} intensity={0.4} />
      <pointLight position={[-10, 10, 10]} intensity={0.3} color="#4fc3f7" />

      <TruckContainer dimensions={truckDimensions} />
      <TemperatureZones />
      <LoadingIndicators />

      <TruckBedPhysics dimensions={truckDimensions} />

      <PhysicsSimulationController />

      {boxRenderers}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0.1} />
      </mesh>

      <gridHelper args={[100, 50, "#333333", "#1a1a1a"]} position={[0, 0, 0]} />

      <PerformanceStats />
      <PhysicsStatusIndicator />

      {physicsEnabled && <PhysicsDebugger />}
    </>
  )
}

export function TruckVisualization({ viewMode }: TruckVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { boxes, optimizeLayout, isSimulationRunning, simulationForces } = useOptimizationStore()
  // ... (rest of hook) since this tool call only replaces lines in the file, we must be careful.

  // Wait, I cannot change the hook destructuring easily if line numbers are off or if I don't see them.
  // I will check the file content again to be sure of line numbers for destructuring.
  // Line 117: const { boxes, optimizeLayout, isSimulationRunning } = useOptimizationStore()

  // And Physics component is around line 295.

  // I will update the destructuring first, then the Physics prop.
  // Actually, Scene component (line 46) gets store too, but Physics is in TruckVisualization component (line 115).
  // TruckVisualization component (line 115) renders Physics.

  // Step 1: Update truck visualization destructuring.
  // Step 2: Update Physics prop.

  // I'll do it in multiple chunks.
  const { deliveryStops } = useRouteStore()
  const [forceUpdate, setForceUpdate] = useState(0)
  const [hoveredBox, setHoveredBox] = useState<HoveredBoxInfo | null>(null)
  const [selectedBox, setSelectedBox] = useState<SelectedBoxInfo | null>(null)

  // Sidebar State for Left Panel Management
  // 'orders', 'boxes', 'physics' or null for all collapsed
  const [activePanel, setActivePanel] = useState<'orders' | 'boxes' | 'physics' | null>(null)

  const handlePanelToggle = (panel: 'orders' | 'boxes' | 'physics') => {
    setActivePanel(prev => prev === panel ? null : panel)
  }

  // Sync global state to local state for UI rendering
  useEffect(() => {
    // ...
    const onHover = (box: HoveredBoxInfo | null) => setHoveredBox(box)
    const onSelect = (box: SelectedBoxInfo | null) => setSelectedBox(box)

    globalHoverCallbacks.add(onHover)
    globalSelectCallbacks.add(onSelect)

    return () => {
      globalHoverCallbacks.delete(onHover)
      globalSelectCallbacks.delete(onSelect)
    }
  }, [])

  useEffect(() => {
    if (isSimulationRunning) {
      // ...
      setHoveredBox(null)
      setSelectedBox(null)
      setGlobalHoveredBox(null)
      setGlobalSelectedBox(null)
      globalHoverCallbacks.forEach(callback => callback(null))
      globalSelectCallbacks.forEach(callback => callback(null))

      // Auto-open physics panel when simulation starts?
      // setActivePanel('physics') // Optional enhancement
    }
  }, [isSimulationRunning])

  useEffect(() => {
    console.log('🔄 TruckVisualization: Boxes changed, forcing update')
    setForceUpdate(prev => prev + 1)
  }, [boxes])

  useEffect(() => {
    // Initialize WebGL extensions if needed
    if (canvasRef.current) {
      // ... (Optional extension loading)
    }

    // Auto-populate defaults
    ensureRouteStoreHasDefaults()
  }, [])

  const handleOptimize = () => {
    console.log('🔄 Optimize button clicked from TruckVisualization')
    optimizeLayout()
  }



  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden shadow-2xl border border-gray-800 rounded-xl">
      {/* 3D View */}
      {(viewMode === "3d" || viewMode === "hybrid") && (
        <div className={`w-full h-full ${viewMode === "hybrid" ? "h-2/3" : ""}`}>
          {/* Overlays */}
          {/* Overlays - Sidebar Management */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            {/* Orders Panel */}
            <OrdersPanel
              minimized={activePanel !== 'orders'}
              onToggle={() => handlePanelToggle('orders')}
              className="pointer-events-auto relative !top-0 !left-0 !bottom-auto !right-auto"
            />

            {/* Box List Panel */}
            <BoxListPanel
              minimized={activePanel !== 'boxes'}
              onToggle={() => handlePanelToggle('boxes')}
              className="pointer-events-auto relative !top-0 !left-0 !bottom-auto !right-auto"
            />

            {/* Physics Status Panel */}
            <StatusPanel
              minimized={activePanel !== 'physics'}
              onToggle={() => handlePanelToggle('physics')}
              className="pointer-events-auto relative !top-0 !left-0 !bottom-auto !right-auto"
            />
          </div>

          <BoxTooltip hoveredBox={hoveredBox} />

          {deliveryStops.length > 0 && (
            <div className="absolute top-24 right-4 z-10 bg-gray-900/95 text-white p-3 rounded-lg border border-gray-600 shadow-xl backdrop-blur-sm max-h-64 overflow-y-auto w-64">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">🚛 Active Route</h4>
              <div className="space-y-1 text-xs">
                {deliveryStops.map((stop, index) => {
                  return (
                    <div key={stop.id} className="flex justify-between gap-2">
                      <span className={stop.isCompleted ? 'text-green-400' : 'text-white'}>
                        {index + 1}. {stop.warehouse.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Unassigned Boxes Warning */}
          {(() => {
            const unassignedCount = boxes.filter(box => !box.destination).length
            return unassignedCount > 0 ? (
              <div className="absolute bottom-4 left-4 z-10 bg-orange-900/95 text-white p-3 rounded-lg border border-orange-600">
                <div className="text-sm font-bold text-orange-400">
                  ⚠️ {unassignedCount} Unassigned Box{unassignedCount !== 1 ? 'es' : ''}
                </div>
                <div className="text-xs text-orange-300 mt-1">
                  Add route stops and assign destinations
                </div>
              </div>
            ) : null
          })()}

          {/* Interaction Instructions */}
          {!isSimulationRunning && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-gray-900/90 text-white px-3 py-1 rounded text-xs border border-gray-600">
                💡 Hover for properties • Click to select • Use controls to move/rotate
              </div>
            </div>
          )}

          {/* Simulation Status */}
          {isSimulationRunning && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-red-900/95 text-white px-4 py-2 rounded text-sm border border-red-600 animate-pulse shadow-xl backdrop-blur-sm">
                🚛 PHYSICS SIMULATION ACTIVE - Manual controls disabled
              </div>
            </div>
          )}

          {/* Canvas */}
          <Canvas
            key={`canvas-${forceUpdate}`}
            ref={canvasRef}
            shadows="soft"
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              // stencil: false,
              depth: true,
              logarithmicDepthBuffer: true,
              precision: "highp",
            }}
            dpr={[1, 2]}
            performance={{ min: 0.8 }}
            frameloop="always"
            camera={{ position: [20, 15, 20], fov: 50 }}
          >
            <Suspense
              fallback={
                <Html center>
                  <div className="text-white bg-gray-900/80 p-4 rounded">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading 3D Scene...
                  </div>
                </Html>
              }
            >
              <Physics
                gravity={[0, -9.81 * (simulationForces?.gravity || 1.0), 0]}
                iterations={20}
                broadphase="SAP"
                allowSleep={false}
                defaultContactMaterial={{
                  friction: 0.6,
                  restitution: 0.3,
                  contactEquationStiffness: 1e8,
                  contactEquationRelaxation: 3,
                }}
                size={4096}
                axisIndex={0}
              >
                <Scene key={`scene-${forceUpdate}`} />
              </Physics>
            </Suspense>
            <Stats className="!left-auto !right-0 !top-auto !bottom-0" />
          </Canvas>


        </div>
      )}

      {/* 2D View Overlay - if any */}
      {(viewMode === "hybrid") && (
        <div className="absolute top-4 right-4 z-10 w-64 h-48 border border-gray-600 bg-gray-900/95 rounded-lg overflow-hidden">
          <TwoDRenderer isOverlay />
          {/* Note: TwoDRenderer needs to support isOverlay prop if we passed it, but original code just rendered it. 
           I should check TwoDRenderer props. Assuming it handles it or ignores it. 
           In original code: <TwoDRenderer isOverlay /> was used.
        */}
        </div>
      )}

      {/* 2D View Full */}
      {viewMode === "2d" && (
        <div className="w-full h-full bg-white">
          <TwoDRenderer />
        </div>
      )}
    </div>
  )
}