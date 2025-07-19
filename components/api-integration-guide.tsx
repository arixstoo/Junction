import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, MessageSquare, Smartphone } from "lucide-react"

export function ApiIntegrationGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Backend Integration Guide</h2>
        <p className="text-gray-500">Guide for the backend developer to integrate real APIs</p>
      </div>

      {/* Database Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            MongoDB Database Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge className="mb-2">Replace Mock Service</Badge>
            <p className="text-sm text-gray-600 mb-3">
              Replace the MockDataService in <code>lib/mongodb.ts</code> with real MongoDB connections.
            </p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm">
                {`// Collections needed:
- ponds: Store pond information and current parameters
- alerts: Store alert history and status
- users: Store user preferences and contact info
- sensor_data: Store historical sensor readings`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Endpoints to Implement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Badge variant="outline">GET /api/ponds</Badge>
              <p className="text-sm text-gray-600">Fetch all ponds with current parameters</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">POST /api/ponds</Badge>
              <p className="text-sm text-gray-600">Create new pond</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">GET /api/alerts</Badge>
              <p className="text-sm text-gray-600">Fetch all alerts</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">POST /api/alerts</Badge>
              <p className="text-sm text-gray-600">Create new alert and send notifications</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">PUT /api/alerts/:id/resolve</Badge>
              <p className="text-sm text-gray-600">Mark alert as resolved</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">GET /api/sensor-data/:pondId</Badge>
              <p className="text-sm text-gray-600">Get historical sensor data for charts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS/WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS/WhatsApp Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge className="mb-2">Twilio Integration</Badge>
            <p className="text-sm text-gray-600 mb-3">
              Replace MockNotificationService in <code>lib/notifications.ts</code> with Twilio API calls.
            </p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm">
                {`// Environment variables needed:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Real-time Updates (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">
              WebSocket/SSE
            </Badge>
            <p className="text-sm text-gray-600">
              For real-time sensor data updates, implement WebSocket connections or Server-Sent Events.
            </p>
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">
              IoT Integration
            </Badge>
            <p className="text-sm text-gray-600">
              Connect to IoT sensors to automatically update pond parameters and trigger alerts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
