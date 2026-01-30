# CargoVision: Team Contribution Breakdown

This document outlines the allocation of responsibilities and technical contributions for the **CargoVision** project, distributed among a 3-member team.

---

## 👨‍💻 Member 1: Core Architect & Logic Lead
**Focus:** State Management, Optimization Algorithms, & Data Systems
*The "Brain" of the application.*

### Key Contributions
*   **State Architecture (Zustand Stores)**
    *   Designed the central `optimization-store.ts` (500+ lines) to manage application state, ensuring synchronization between the 3D scene, UI, and algorithms.
    *   Implemented `route-store.ts` for delivery route logic and `workspace-store.ts` for local persistence.
*   **Optimization Engine**
    *   Developed the **Advanced 3D Placement Engine** (`advanced-3d-placement-engine.ts`), a custom algorithm that calculates optimal box positions based on weight, volume, and stability.
    *   Implemented "First-In-Last-Out" (FILO) logic for delivery stops.
*   **Data Management**
    *   Built the `BoxManager` component for complex CRUD operations on cargo items.
    *   Created `ReportGenerator` to export load manifests and simulation data.
    *   Implemented CSV/Excel import functionality for bulk data loading.

**Files Authored/Maintained:**
*   `store/optimization-store.ts`
*   `store/advanced-3d-placement-engine.ts`
*   `store/route-store.ts`
*   `components/box-manager.tsx`
*   `components/report-generator.tsx`

---

## 🎮 Member 2: 3D Engine & Physics Specialist
**Focus:** Three.js Rendering, Physics Simulation, & Visualization
*The "Visuals" & "Simulation" of the application.*

### Key Contributions
*   **3D Visualization Engine**
    *   Implemented the interactive 3D scene using **React Three Fiber** and **Drei**.
    *   Created the `TruckVisualization` environment with dynamic lighting, shadows, and camera controls (`OrbitControls`).
    *   Modeled the `TruckContainer` and `TemperatureZones` components.
*   **Physics Simulation Integration**
    *   Integrated **Cannon.js** via `@react-three/cannon` for real-time physics.
    *   Developed `EnhancedBoxRenderer` to handle physical properties (mass, friction, restitution).
    *   Implemented the `PhysicsPanel` to allow users to tweak gravity and stability parameters in real-time.
*   **Hybrid 2D/3D Rendering**
    *   Built the `TwoDRenderer` for top-down technical views using the HTML5 Canvas API.
    *   Synchronized 3D selection events with finding and highlighting boxes in the 3D space.

**Files Authored/Maintained:**
*   `components/truck-visualization.tsx`
*   `components/3d/*` (TruckContainer, BoxRenderers, PhysicsDebugger)
*   `components/2d/two-d-renderer.tsx`
*   `components/physics-panel.tsx`
*   `components/simulation-controls.tsx`

---

## 🎨 Member 3: Frontend UX/UI & Integration Lead
**Focus:** Interface Design, User Experience, & Application Flow
*The "Look & Feel" of the application.*

### Key Contributions
*   **UI/UX Design System**
    *   Designed the modern, glassmorphic "Dark Mode" aesthetic using **Tailwind CSS**.
    *   Implemented the responsive "Sidebar Layout" to maximize 3D workspace area while keeping tools accessible.
    *   Created the `StatusPanel` and `ScoreDisplay` for real-time feedback.
*   **Application Routing & flows**
    *   Built the "Setup Wizard" (`app/new/page.tsx`) for creating workspaces.
    *   Designed the "Landing Page" and "Warehouse Dashboard" layouts.
    *   Executed the complete rebranding from "PackPilot" to "**CargoVision**".
*   **Map & Orders Integration**
    *   Integrated **Leaflet** for the `MapVisualization` component to display delivery routes.
    *   Created the `OrdersPanel` and `WorkspaceSelector` for high-level logistics management.

**Files Authored/Maintained:**
*   `app/*` (layout.tsx, page.tsx, new/page.tsx, warehouse/page.tsx)
*   `components/ui/*` (Button, Card, Tabs, Inputs)
*   `components/workspace-selector.tsx`
*   `components/map-visualization.tsx`
*   `components/status-panel.tsx`

---

## 🏆 Project Summary for Jury
*   **Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Zustand.
*   **Core Feature:** Real-time 3D logistics optimization with physics validation.
*   **Collaboration:** 
    *   **Member 1** built the brains (engine).
    *   **Member 2** built the world (3D/Physics).
    *   **Member 3** built the experience (UI/App).
