import { create } from 'zustand'
import { useOptimizationStore } from "@/store/optimization-store"

export interface Warehouse {
    id: number
    name: string
    address: string
    coordinates: {
        lat: number
        lng: number
    }
    capacity: number
    orderWarehouses: any[]
    deliveryRoutes: any[]
}

export interface DeliveryStop {
    id: string
    warehouseId: number
    warehouse: Warehouse
    order: number
    estimatedArrival?: string
    isCompleted: boolean
    name: string // Display name for the stop - now just "Stop 1", "Stop 2", etc.
}

// Route Store for synchronized destinations
interface RouteStore {
    deliveryStops: DeliveryStop[]
    addDeliveryStop: (warehouse: Warehouse) => void
    removeDeliveryStop: (stopId: string) => void
    reorderStop: (stopId: string, direction: 'up' | 'down') => void
    toggleStopCompletion: (stopId: string) => void
    getAvailableDestinations: () => string[]
    setDeliveryStops: (stops: DeliveryStop[]) => void
}

export const useRouteStore = create<RouteStore>((set, get) => ({
    deliveryStops: [],

    setDeliveryStops: (stops) => {
        set({ deliveryStops: stops })
        syncDestinationsWithRoute(stops)
    },

    addDeliveryStop: (warehouse) => {
        const { deliveryStops } = get()

        const newStop: DeliveryStop = {
            id: `stop-${Date.now()}-${warehouse.id}`,
            warehouseId: warehouse.id,
            warehouse,
            order: deliveryStops.length + 1,
            isCompleted: false,
            name: warehouse.name || `Stop ${deliveryStops.length + 1}`
        }
        const updatedStops = [...deliveryStops, newStop]
        set({ deliveryStops: updatedStops })

        // Sync with optimization store
        syncDestinationsWithRoute(updatedStops)
    },

    removeDeliveryStop: (stopId) => {
        const { deliveryStops } = get()
        const removedStop = deliveryStops.find(s => s.id === stopId)
        const updated = deliveryStops
            .filter(stop => stop.id !== stopId)
            .map((stop, index) => ({
                ...stop,
                order: index + 1
                // Keep original name if possible, or update priority only if generic "Stop N" pattern was used
                // For now, let's keep the name stable to avoid confusion, or optional re-indexing
            }))

        set({ deliveryStops: updated })

        // Clear boxes assigned to removed stop and sync
        if (removedStop) {
            reassignBoxesFromRemovedStop(removedStop.name)
        }
        syncDestinationsWithRoute(updated)
    },

    reorderStop: (stopId, direction) => {
        const { deliveryStops } = get()
        const stopIndex = deliveryStops.findIndex(stop => stop.id === stopId)
        if (stopIndex === -1) return

        const newStops = [...deliveryStops]
        const targetIndex = direction === 'up' ? stopIndex - 1 : stopIndex + 1

        if (targetIndex < 0 || targetIndex >= newStops.length) return

            // Swap stops
            ;[newStops[stopIndex], newStops[targetIndex]] = [newStops[targetIndex], newStops[stopIndex]]

        // Update order numbers 
        const reorderedStops = newStops.map((stop, index) => ({
            ...stop,
            order: index + 1
        }))

        set({ deliveryStops: reorderedStops })
        syncDestinationsWithRoute(reorderedStops)
    },

    toggleStopCompletion: (stopId) => {
        const { deliveryStops } = get()
        const updated = deliveryStops.map(stop =>
            stop.id === stopId ? { ...stop, isCompleted: !stop.isCompleted } : stop
        )
        set({ deliveryStops: updated })
    },

    getAvailableDestinations: () => {
        const { deliveryStops } = get()
        return deliveryStops.map(stop => stop.name)
    }
}))

// Sync functions
const syncDestinationsWithRoute = (deliveryStops: DeliveryStop[]) => {
    const { boxes, updateBox } = useOptimizationStore.getState()
    const availableDestinations = deliveryStops.map(stop => stop.name)

    // Update boxes with invalid destinations
    boxes.forEach(box => {
        if (box.destination && !availableDestinations.includes(box.destination)) {
            updateBox(box.id, { destination: '' })
        }
    })
}

const reassignBoxesFromRemovedStop = (removedStopName: string) => {
    const { boxes, updateBox } = useOptimizationStore.getState()

    // Clear destination for boxes assigned to removed stop
    boxes.forEach(box => {
        if (box.destination === removedStopName) {
            updateBox(box.id, { destination: '' })
        }
    })
}

// Initialize route store with delivery stops
export function initializeRouteStore(routes: any[]): boolean {
    try {
        if (!routes || routes.length === 0) {
            console.warn('No routes provided for initialization');
            // Ensure empty state
            useRouteStore.setState({ deliveryStops: [] });
            return false;
        }

        // Clear existing stops first
        useRouteStore.setState({ deliveryStops: [] });

        // Add each route as a delivery stop
        routes.forEach((route, index) => {
            const warehouse: Warehouse = {
                id: index + 1,
                name: route.name,
                address: route.address,
                coordinates: route.coordinates,
                capacity: route.estimatedBoxes * 100, // Estimate capacity
                orderWarehouses: [],
                deliveryRoutes: []
            };

            // Create the delivery stop
            const deliveryStop: DeliveryStop = {
                id: route.id,
                warehouseId: warehouse.id,
                warehouse,
                order: route.priority,
                estimatedArrival: new Date(Date.now() + route.priority * 60 * 60 * 1000).toISOString(),
                isCompleted: false,
                name: route.name || `Stop ${route.priority}` // Use Actual Name
            };

            // Add to store
            useRouteStore.setState(state => ({
                deliveryStops: [...state.deliveryStops, deliveryStop]
            }));
        });

        console.log('✅ Route store initialized with', routes.length, 'stops');
        return true;
    } catch (error) {
        console.error('Failed to initialize route store:', error);
        return false;
    }
}

// Check if route store is ready and has stops
export function isRouteStoreReady(): boolean {
    try {
        const { deliveryStops } = useRouteStore.getState();
        return Array.isArray(deliveryStops) && deliveryStops.length > 0;
    } catch (error) {
        console.error('Error checking route store readiness:', error);
        return false;
    }
}

// Additional helper function to get available destinations safely
export function getAvailableDestinations(): string[] {
    try {
        const { deliveryStops } = useRouteStore.getState();
        if (!deliveryStops || deliveryStops.length === 0) {
            return []; // Return empty if no stops to avoid confusing UI
        }
        return deliveryStops.map(stop => stop.name);
    } catch (error) {
        console.warn('Error getting destinations from route store:', error);
        return [];
    }
}

// Initialize route store with default stops if empty
export function ensureRouteStoreHasDefaults(): void {
    try {
        const { deliveryStops } = useRouteStore.getState();

        if (deliveryStops.length === 0) {
            console.log('🔄 Initializing route store with default stops');

            const defaultWarehouses: Warehouse[] = [
                {
                    id: 1,
                    name: "Stop 1: Hitech City",
                    address: "Mindspace IT Park, Hitech City, Hyderabad, Telangana 500081",
                    coordinates: { lat: 17.4455, lng: 78.3751 },
                    capacity: 10000,
                    orderWarehouses: [],
                    deliveryRoutes: []
                },
                {
                    id: 2,
                    name: "Stop 2: Banjara Hills",
                    address: "GVK One Mall, Rd Number 1, Banjara Hills, Hyderabad, Telangana 500034",
                    coordinates: { lat: 17.4126, lng: 78.4390 },
                    capacity: 5000,
                    orderWarehouses: [],
                    deliveryRoutes: []
                },
                {
                    id: 3,
                    name: "Stop 3: Uppal",
                    address: "Uppal Metro Station, Uppal, Hyderabad, Telangana 500039",
                    coordinates: { lat: 17.4018, lng: 78.5602 },
                    capacity: 5000,
                    orderWarehouses: [],
                    deliveryRoutes: []
                },
                {
                    id: 4,
                    name: "Stop 4: Secunderabad",
                    address: "Secunderabad Railway Station, Hyderabad, Telangana 500003",
                    coordinates: { lat: 17.4399, lng: 78.4983 },
                    capacity: 5000,
                    orderWarehouses: [],
                    deliveryRoutes: []
                }
            ];

            // Add default stops
            defaultWarehouses.forEach(warehouse => {
                useRouteStore.getState().addDeliveryStop(warehouse);
            });

            console.log('✅ Default route stops added');
        }
    } catch (error) {
        console.error('Error ensuring route store defaults:', error);
    }
}
