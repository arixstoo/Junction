import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MapPin } from "lucide-react"

interface AlertCardProps {
  id: string
  pond: string
  parameter: string
  message: string
  severity: "warning" | "critical"
  timestamp: string
  location: string
  isActive: boolean
  language?: "en" | "fr"
}

export function AlertCard({
  pond,
  parameter,
  message,
  severity,
  timestamp,
  location,
  isActive,
  language = "en",
}: AlertCardProps) {
  const getSeverityColor = () => {
    return severity === "critical" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
  }

  const getSeverityBadge = () => {
    const criticalLabel = language === "fr" ? "Critique" : "Critical"
    const warningLabel = language === "fr" ? "Attention" : "Warning"

    return severity === "critical" ? (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{criticalLabel}</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{warningLabel}</Badge>
    )
  }

  const formatTimestamp = (timestampString: string) => {
    try {
      const date = new Date(timestampString)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

      if (diffInMinutes < 60) {
        const minutesLabel = language === "fr" ? "minutes" : "minutes ago"
        return `${diffInMinutes} ${minutesLabel}`
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        const hoursLabel =
          language === "fr" ? (hours === 1 ? "heure" : "heures") : hours === 1 ? "hour ago" : "hours ago"
        return `${hours} ${hoursLabel}`
      } else {
        const locale = language === "fr" ? "fr-FR" : "en-US"
        return date.toLocaleDateString(locale)
      }
    } catch {
      return language === "fr" ? "Heure inconnue" : "Unknown time"
    }
  }

  return (
    <Card className={`p-4 border-2 ${getSeverityColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${severity === "critical" ? "text-red-600" : "text-yellow-600"}`} />
          <h3 className="font-semibold text-gray-900">{pond}</h3>
          {isActive && <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
        </div>
        {getSeverityBadge()}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          {parameter}: {message}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(timestamp)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
