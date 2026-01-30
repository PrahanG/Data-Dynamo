export interface HoveredBoxInfo {
    id: string
    name: string
    position: { x: number; y: number; z: number }
    dimensions: { width: number; height: number; length: number }
    weight: number
    isFragile: boolean
    temperatureZone: string
    destination: string
    screenPosition: { x: number; y: number }
}

export interface SelectedBoxInfo {
    id: string
    name: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    isRotated: boolean
}
