
import { NextResponse } from "next/server"


// Use global storage to persist across hot reloads in dev
const globalForOrders = globalThis as unknown as { mockOrders: any[] }

if (!globalForOrders.mockOrders) {
    globalForOrders.mockOrders = [] // Start with empty orders
}

export async function GET() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return NextResponse.json(globalForOrders.mockOrders)
}


export async function POST(request: Request) {
    try {
        const body = await request.json()
        const newOrders = Array.isArray(body) ? body : [body]

        // Assign IDs and defaults
        const processedOrders = newOrders.map((order: any) => ({
            ...order,
            id: Math.floor(Math.random() * 10000) + 2000, // Random ID > 2000
            status: order.status || "pending",
            createdAt: new Date().toISOString(),
        }))

        globalForOrders.mockOrders = [...processedOrders, ...globalForOrders.mockOrders]

        return NextResponse.json({ success: true, count: processedOrders.length, orders: processedOrders })
    } catch (error) {
        return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, status } = body

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 })
        }

        const orderIndex = globalForOrders.mockOrders.findIndex((o: any) => o.id === id)

        if (orderIndex !== -1) {
            globalForOrders.mockOrders[orderIndex] = {
                ...globalForOrders.mockOrders[orderIndex],
                status
            }
            return NextResponse.json({ success: true, order: globalForOrders.mockOrders[orderIndex] })
        }

        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })

    } catch (error) {
        return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }
}
