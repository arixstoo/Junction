import { NextResponse } from "next/server"
import { dataService } from "@/lib/mongodb"
import { notificationService, sendAlertNotifications } from "@/lib/notifications"

export async function GET() {
  try {
    const alerts = await dataService.getAllAlerts()
    return NextResponse.json({ success: true, data: alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create alert using mock service
    const alertId = await dataService.createAlert({
      ...body,
      timestamp: new Date(),
      notificationsSent: {
        sms: false,
        whatsapp: false,
        email: false,
      },
    })

    // Mock user for notifications - Backend developer will get from session/database
    const mockUser = {
      email: "demo@ocea.com",
      phone: "+213555123456",
      language: "fr" as const,
      notificationPreferences: {
        sms: true,
        whatsapp: true,
        email: true,
      },
    }

    // Send mock notifications
    await sendAlertNotifications(body, mockUser, notificationService)

    return NextResponse.json({
      success: true,
      data: { id: alertId },
    })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 })
  }
}
