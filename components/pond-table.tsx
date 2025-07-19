"use client"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, AlertTriangle, Thermometer, Activity, Droplets, Waves, Beaker } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import { dataService } from "@/lib/mongodb"
import { useState, useEffect } from "react"
import type { PondData } from "@/lib/mongodb"

interface PondTableProps {
  language: Language
  onViewDetails?: (pondId: string) => void
}

export function PondTable({ language, onViewDetails }: PondTableProps) {
  const { t } = useTranslation(language)
  const [ponds, setPonds] = useState<PondData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPonds()
  }, [])

  const loadPonds = async () => {
    try {
      const pondsData = await dataService.getPonds()
      setPonds(pondsData)
    } catch (error) {
      console.error("Error loading ponds:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">{t("normal")}</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">{t("warning")}</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">{t("critical")}</Badge>
    }
  }

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

  if (loading) {
    return <div className="text-center py-4">{t("loading")}</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">{t("pond")}</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Thermometer className="h-4 w-4" />
                <span className="hidden sm:inline">{t("temperature")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">{t("phLevel")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Droplets className="h-4 w-4" />
                <span className="hidden sm:inline">{t("oxygenLevel")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Waves className="h-4 w-4" />
                <span className="hidden sm:inline">{t("turbidity")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Beaker className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nitrate")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Beaker className="h-4 w-4" />
                <span className="hidden sm:inline">{t("ammonia")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">{t("alerts")}</TableHead>
            <TableHead className="text-center">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ponds.map((pond) => (
            <TableRow key={pond._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-blue-100">
                    <img src="/placeholder.svg?height=32&width=32" alt={pond.name} />
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{pond.name}</div>
                    <div className="text-xs text-gray-500">{pond.location}</div>
                    <div className="text-xs text-gray-400">
                      {t("lastUpdated")}: {formatTime(pond.lastUpdate)}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm">{pond.parameters?.temperature?.value || 0}°C</span>
                  {getStatusBadge(pond.parameters?.temperature?.status || "normal")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm">{pond.parameters?.ph?.value || 0}</span>
                  {getStatusBadge(pond.parameters?.ph?.status || "normal")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm">{pond.parameters?.oxygen?.value || 0}</span>
                  {getStatusBadge(pond.parameters?.oxygen?.status || "normal")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm">{pond.parameters?.turbidity?.value || 0}</span>
                  {getStatusBadge(pond.parameters?.turbidity?.status || "normal")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm">{pond.parameters?.nitrate?.value || 0}</span>
                  {getStatusBadge(pond.parameters?.nitrate?.status || "normal")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium text-sm">{pond.parameters?.ammonia?.value || 0}</span>
                  {getStatusBadge(pond.parameters?.ammonia?.status || "normal")}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {pond.alerts > 0 ? (
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">{pond.alerts}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">{t("none")}</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails?.(pond._id || "")
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("viewDetails")}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
