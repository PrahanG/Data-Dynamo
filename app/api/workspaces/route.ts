
import { NextResponse } from "next/server"

// Use global storage to persist workspaces across hot reloads
const globalForWorkspaces = globalThis as unknown as { mockWorkspaces: any[] }

if (!globalForWorkspaces.mockWorkspaces) {
    globalForWorkspaces.mockWorkspaces = []
}

export async function GET() {
    return NextResponse.json(globalForWorkspaces.mockWorkspaces)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Basic validation
        if (!body.name || !body.truckId) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: name, truckId" },
                { status: 400 }
            )
        }

        const newWorkspace = {
            id: body.id || `ws-${Date.now()}`,
            name: body.name,
            description: body.description || "",
            truckId: body.truckId,
            routes: body.routes || [],
            createdAt: new Date().toISOString(),
            status: "active"
        }


        globalForWorkspaces.mockWorkspaces.push(newWorkspace)

        return NextResponse.json({
            success: true,
            workspace: newWorkspace,
            message: "Workspace created successfully"
        })
    } catch (error) {
        console.error("Error creating workspace:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()

        if (!body.id) {
            return NextResponse.json(
                { success: false, error: "Missing workspace ID" },
                { status: 400 }
            )
        }

        const index = globalForWorkspaces.mockWorkspaces.findIndex((w: any) => w.id === body.id)

        if (index === -1) {
            // Upsert if not found? Or error? Let's upsert for simplicity in this flow
            globalForWorkspaces.mockWorkspaces.push({
                ...body,
                updatedAt: new Date().toISOString()
            })
        } else {
            globalForWorkspaces.mockWorkspaces[index] = {
                ...globalForWorkspaces.mockWorkspaces[index],
                ...body,
                updatedAt: new Date().toISOString()
            }
        }

        return NextResponse.json({
            success: true,
            message: "Workspace updated successfully"
        })
    } catch (error) {
        console.error("Error updating workspace:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
