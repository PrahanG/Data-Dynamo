
import { NextResponse } from "next/server"

const mockWarehouses = [
    {
        id: 1,
        name: "Central Distribution Hub",
        address: "123 Main St, Dallas, TX",
        coordinates: { lat: 32.7767, lng: -96.7970 },
        capacity: 50000,
        orderWarehouses: [],
        deliveryRoutes: []
    },
    {
        id: 2,
        name: "North Dallas Store #4532",
        address: "456 Oak Ave, Dallas, TX",
        coordinates: { lat: 32.9067, lng: -96.8070 },
        capacity: 5000,
        orderWarehouses: [],
        deliveryRoutes: []
    },
    {
        id: 3,
        name: "East Side Market #2901",
        address: "789 Pine St, Mesquite, TX",
        coordinates: { lat: 32.7667, lng: -96.6070 },
        capacity: 4500,
        orderWarehouses: [],
        deliveryRoutes: []
    },
    {
        id: 4,
        name: "West End Grocer #7834",
        address: "321 Elm Dr, Irving, TX",
        coordinates: { lat: 32.8167, lng: -96.9570 },
        capacity: 6000,
        orderWarehouses: [],
        deliveryRoutes: []
    }
]

export async function GET() {
    await new Promise((resolve) => setTimeout(resolve, 600)) // Simulate network delay
    return NextResponse.json({
        success: true,
        data: mockWarehouses
    })
}
