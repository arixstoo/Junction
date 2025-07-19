"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Thermometer, Droplets, Activity, MapPin, Clock, Beaker, Waves, AlertTriangle, Eye } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type { PondData } from "@/lib/mongodb"

interface PondDetailCardProps {
  pond: PondData
  language: Language
  onViewDetails?: (pondId: string) => void
}

export function PondDetailCard({ pond, language, onViewDetails }: PondDetailCardProps) {
  const { t } = useTranslation(language)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "normal":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Safe access to pond parameters with fallbacks
  const temperature = pond.parameters?.temperature || { value: 0, status: "normal" as const }
  const ph = pond.parameters?.ph || { value: 0, status: "normal" as const }
  const oxygen = pond.parameters?.oxygen || { value: 0, status: "normal" as const }
  const turbidity = pond.parameters?.turbidity || { value: 0, status: "normal" as const }
  const nitrate = pond.parameters?.nitrate || { value: 0, status: "normal" as const }
  const nitrite = pond.parameters?.nitrite || { value: 0, status: "normal" as const }
  const ammonia = pond.parameters?.ammonia || { value: 0, status: "normal" as const }
  const waterLevel = pond.parameters?.waterLevel || { value: 0, status: "normal" as const }

  // Format the last update time
  const formatLastUpdate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return language === "fr" ? "Inconnu" : "Unknown"
    }
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{pond.name}</CardTitle>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <MapPin className="h-4 w-4" />
                {pond.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Clock className="h-3 w-3" />
                {t("lastUpdated")}: {formatLastUpdate(pond.lastUpdate)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getStatusColor(pond.status)} text-sm px-3 py-1`}>{t(pond.status)}</Badge>
            {pond.alerts > 0 && (
              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {pond.alerts}{" "}
                  {pond.alerts === 1
                    ? language === "fr"
                      ? "alerte"
                      : "alert"
                    : language === "fr"
                      ? "alertes"
                      : "alerts"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Parameters - Larger grid for single pond display */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === "fr" ? "Paramètres actuels" : "Current Parameters"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900">{temperature.value}°C</div>
              <div className="text-sm text-gray-600 mb-2">{t("temperature")}</div>
              <Badge className={`${getStatusColor(temperature.status)} text-xs`} size="sm">
                {t(temperature.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900">{ph.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("phLevel")}</div>
              <Badge className={`${getStatusColor(ph.status)} text-xs`} size="sm">
                {t(ph.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{oxygen.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("oxygenLevel")}</div>
              <Badge className={`${getStatusColor(oxygen.status)} text-xs`} size="sm">
                {t(oxygen.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <Waves className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold text-gray-900">{turbidity.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("turbidity")}</div>
              <Badge className={`${getStatusColor(turbidity.status)} text-xs`} size="sm">
                {t(turbidity.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Beaker className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">{nitrate.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("nitrate")}</div>
              <Badge className={`${getStatusColor(nitrate.status)} text-xs`} size="sm">
                {t(nitrate.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <Beaker className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-gray-900">{nitrite.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("nitrite")}</div>
              <Badge className={`${getStatusColor(nitrite.status)} text-xs`} size="sm">
                {t(nitrite.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
              <Beaker className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-gray-900">{ammonia.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("ammonia")}</div>
              <Badge className={`${getStatusColor(ammonia.status)} text-xs`} size="sm">
                {t(ammonia.status)}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
              <Waves className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
              <div className="text-2xl font-bold text-gray-900">{waterLevel.value}</div>
              <div className="text-sm text-gray-600 mb-2">{t("waterLevel")}</div>
              <Badge className={`${getStatusColor(waterLevel.status)} text-xs`} size="sm">
                {t(waterLevel.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {language === "fr"
              ? "Cliquez sur 'Voir les détails' pour plus d'informations et graphiques"
              : "Click 'View Details' for more information and charts"}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails?.(pond._id || "")
            }}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {t("viewDetails")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
