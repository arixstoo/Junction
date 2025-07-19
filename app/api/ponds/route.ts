import { NextResponse } from "next/server"
import { dataService } from "@/lib/mongodb"

export async function GET() {
  try {
    const ponds = await dataService.getPonds()
    return NextResponse.json({ success: true, data: ponds })
  } catch (error) {
    console.error("Error fetching ponds:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch ponds" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Mock pond creation - Backend developer will implement real database insertion
    console.log("Creating pond:", body)

    return NextResponse.json({
      success: true,
      data: { id: `pond-${Date.now()}` },
    })
  } catch (error) {
    console.error("Error creating pond:", error)
    return NextResponse.json({ success: false, error: "Failed to create pond" }, { status: 500 })
  }
}
