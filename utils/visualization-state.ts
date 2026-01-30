import type { HoveredBoxInfo, SelectedBoxInfo } from "@/types/visualization-types"

// Global state to avoid re-renders
export let globalFocusedBoxId: string | null = null
export let globalHoveredBox: HoveredBoxInfo | null = null
export let globalSelectedBox: SelectedBoxInfo | null = null
export let globalHoverCallbacks: Set<(box: HoveredBoxInfo | null) => void> = new Set()
export let globalSelectCallbacks: Set<(box: SelectedBoxInfo | null) => void> = new Set()

export const setGlobalFocusedBoxId = (id: string | null) => {
    globalFocusedBoxId = id
}

export const setGlobalHoveredBox = (box: HoveredBoxInfo | null) => {
    globalHoveredBox = box
}

export const setGlobalSelectedBox = (box: SelectedBoxInfo | null) => {
    globalSelectedBox = box
}
