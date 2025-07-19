"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PondChart } from "./pond-chart"
import { AlertCard } from "./alert-card"
import { Thermometer, Droplets, Activity, MapPin, Clock, AlertTriangle, Beaker, Waves } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type { PondData, AlertData } from "@/lib/mongodb"
import { TimeFilter, type TimeRange } from "./time-filter"
import { generateHistoricalData, getTimeRangeLabel } from "@/lib/chart-data"
import { useState, useEffect } from "react"

interface PondDetailModalProps {
  pond: PondData | null
  isOpen: boolean
  onClose: () => void
  language: Language
  alerts: AlertData[]
}

export function PondDetailModal({ pond, isOpen, onClose, language, alerts }: PondDetailModalProps) {
  const { t } = useTranslation(language)
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [chartData, setChartData] = useState<{
    temperature: any[]
    ph: any[]
    oxygen: any[]
    turbidity: any[]
    nitrate: any[]
    ammonia: any[]
  }>({
    temperature: [],
    ph: [],
    oxygen: [],
    turbidity: [],
    nitrate: [],
    ammonia: [],
  })

  useEffect(() => {
    if (pond && isOpen) {
      loadChartData()
    }
  }, [pond, timeRange, isOpen])

  const loadChartData = async () => {
    if (!pond) return

    try {
      const [temperatureData, phData, oxygenData, turbidityData, nitrateData, ammoniaData] = await Promise.all([
        generateHistoricalData(pond.parameters?.temperature?.value || 0, "temperature", timeRange, pond._id, language),
        generateHistoricalData(pond.parameters?.ph?.value || 0, "ph", timeRange, pond._id, language),
        generateHistoricalData(pond.parameters?.oxygen?.value || 0, "oxygen", timeRange, pond._id, language),
        generateHistoricalData(pond.parameters?.turbidity?.value || 0, "turbidity", timeRange, pond._id, language),
        generateHistoricalData(pond.parameters?.nitrate?.value || 0, "nitrate", timeRange, pond._id, language),
        generateHistoricalData(pond.parameters?.ammonia?.value || 0, "ammonia", timeRange, pond._id, language),
      ])

      setChartData({
        temperature: temperatureData,
        ph: phData,
        oxygen: oxygenData,
        turbidity: turbidityData,
        nitrate: nitrateData,
        ammonia: ammoniaData,
      })
    } catch (error) {
      console.error("Error loading chart data:", error)
    }
  }

  if (!pond) return null

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

  const pondAlerts = alerts.filter((alert) => alert.pondId === pond._id?.replace("pond-", "") && alert.isActive)

  // Safe access to parameters with fallbacks
  const temperature = pond.parameters?.temperature || { value: 0, status: "normal" as const }
  const ph = pond.parameters?.ph || { value: 0, status: "normal" as const }
  const oxygen = pond.parameters?.oxygen || { value: 0, status: "normal" as const }
  const turbidity = pond.parameters?.turbidity || { value: 0, status: "normal" as const }
  const nitrate = pond.parameters?.nitrate || { value: 0, status: "normal" as const }
  const nitrite = pond.parameters?.nitrite || { value: 0, status: "normal" as const }
  const ammonia = pond.parameters?.ammonia || { value: 0, status: "normal" as const }
  const waterLevel = pond.parameters?.waterLevel || { value: 0, status: "normal" as const }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const locale = language === "fr" ? "fr-FR" : "en-US"
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return t("unknown")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{pond.name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-normal">
                <MapPin className="h-3 w-3" />
                {pond.location}
              </div>
            </div>
            <Badge className={getStatusColor(pond.status)}>{t(pond.status as any)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Parameters - Extended Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-xl font-bold">{temperature.value}°C</div>
                  <div className="text-xs text-gray-500">{t("temperature")}</div>
                  <Badge className={`mt-1 ${getStatusColor(temperature.status)}`} size="sm">
                    {t(temperature.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-xl font-bold">{ph.value}</div>
                  <div className="text-xs text-gray-500">{t("phLevel")}</div>
                  <Badge className={`mt-1 ${getStatusColor(ph.status)}`} size="sm">
                    {t(ph.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-xl font-bold">{oxygen.value}</div>
                  <div className="text-xs text-gray-500">{t("oxygenLevel")} (mg/L)</div>
                  <Badge className={`mt-1 ${getStatusColor(oxygen.status)}`} size="sm">
                    {t(oxygen.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Waves className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <div className="text-xl font-bold">{turbidity.value}</div>
                  <div className="text-xs text-gray-500">
                    {language === "fr" ? "Turbidité (NTU)" : "Turbidity (NTU)"}
                  </div>
                  <Badge className={`mt-1 ${getStatusColor(turbidity.status)}`} size="sm">
                    {t(turbidity.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Beaker className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-xl font-bold">{nitrate.value}</div>
                  <div className="text-xs text-gray-500">{language === "fr" ? "Nitrate (mg/L)" : "Nitrate (mg/L)"}</div>
                  <Badge className={`mt-1 ${getStatusColor(nitrate.status)}`} size="sm">
                    {t(nitrate.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Beaker className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <div className="text-xl font-bold">{nitrite.value}</div>
                  <div className="text-xs text-gray-500">{language === "fr" ? "Nitrite (mg/L)" : "Nitrite (mg/L)"}</div>
                  <Badge className={`mt-1 ${getStatusColor(nitrite.status)}`} size="sm">
                    {t(nitrite.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Beaker className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <div className="text-xl font-bold">{ammonia.value}</div>
                  <div className="text-xs text-gray-500">
                    {language === "fr" ? "Ammoniac (mg/L)" : "Ammonia (mg/L)"}
                  </div>
                  <Badge className={`mt-1 ${getStatusColor(ammonia.status)}`} size="sm">
                    {t(ammonia.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Waves className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
                  <div className="text-xl font-bold">{waterLevel.value}</div>
                  <div className="text-xs text-gray-500">
                    {language === "fr" ? "Niveau d'eau (m)" : "Water Level (m)"}
                  </div>
                  <Badge className={`mt-1 ${getStatusColor(waterLevel.status)}`} size="sm">
                    {t(waterLevel.status as any)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Range Filter */}
          <TimeFilter selectedRange={timeRange} onRangeChange={setTimeRange} language={language} />

          {/* Active Alerts for this Pond */}
          {pondAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {t("activeAlerts")} ({pondAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pondAlerts.map((alert) => (
                    <AlertCard key={alert._id} {...alert} language={language} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts - Real Data */}
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  {t("temperature")} - {getTimeRangeLabel(timeRange, language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PondChart parameter={`${t("temperature")} (°C)`} data={chartData.temperature} color="#f97316" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  {t("phLevel")} - {getTimeRangeLabel(timeRange, language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PondChart parameter={t("phLevel")} data={chartData.ph} color="#a855f7" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  {t("oxygenLevel")} - {getTimeRangeLabel(timeRange, language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PondChart parameter={`${t("oxygenLevel")} (mg/L)`} data={chartData.oxygen} color="#3b82f6" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-gray-500" />
                  {language === "fr" ? "Turbidité" : "Turbidity"} - {getTimeRangeLabel(timeRange, language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PondChart
                  parameter={`${language === "fr" ? "Turbidité" : "Turbidity"} (NTU)`}
                  data={chartData.turbidity}
                  color="#6b7280"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-green-500" />
                  {language === "fr" ? "Nitrate" : "Nitrate"} - {getTimeRangeLabel(timeRange, language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PondChart
                  parameter={`${language === "fr" ? "Nitrate" : "Nitrate"} (mg/L)`}
                  data={chartData.nitrate}
                  color="#22c55e"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-red-500" />
                  {language === "fr" ? "Ammoniac" : "Ammonia"} - {getTimeRangeLabel(timeRange, language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PondChart
                  parameter={`${language === "fr" ? "Ammoniac" : "Ammonia"} (mg/L)`}
                  data={chartData.ammonia}
                  color="#ef4444"
                />
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {t("lastUpdated")}: {formatTime(pond.lastUpdate)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {t("configureAlerts")}
              </Button>
              <Button size="sm">{t("exportData")}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
