"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCard } from "@/components/alert-card"
import { useTranslation, type Language } from "@/lib/i18n"
import { dataService, type AlertData } from "@/lib/mongodb"
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2
} from "lucide-react"

interface AlertsPageProps {
  language: Language
}

export function AlertsPage({ language }: AlertsPageProps) {
  const { t } = useTranslation(language)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    loadAlerts()
  }, [])

  useEffect(() => {
    filterAndSortAlerts()
  }, [alerts, searchTerm, severityFilter, statusFilter, sortBy, sortOrder])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const alertsData = await dataService.getActiveAlerts()
      setAlerts(alertsData)
      console.log(`✅ Loaded ${alertsData.length} alerts`)
    } catch (error) {
      console.error("❌ Error loading alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortAlerts = () => {
    let filtered = [...alerts]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.pondName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.parameter.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(alert => {
        if (statusFilter === "active") return alert.isActive
        if (statusFilter === "resolved") return !alert.isActive
        return true
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case "timestamp":
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case "severity":
          const severityOrder = { "critical": 3, "warning": 2, "info": 1 }
          aValue = severityOrder[a.severity] || 0
          bValue = severityOrder[b.severity] || 0
          break
        case "pondName":
          aValue = a.pondName.toLowerCase()
          bValue = b.pondName.toLowerCase()
          break
        default:
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredAlerts(filtered)
  }

  const getSeverityStats = () => {
    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === "critical").length,
      warning: alerts.filter(a => a.severity === "warning").length,
      info: 0, // No info severity in AlertData
      active: alerts.filter(a => a.isActive).length,
      resolved: alerts.filter(a => !a.isActive).length,
    }
    return stats
  }

  const stats = getSeverityStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("alerts")}</h1>
          <p className="text-gray-600 mt-1">
            {t("monitorAndManage")} ({filteredAlerts.length} of {alerts.length})
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("loading")}
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <AlertTriangle className="h-4 w-4" />
            {t("configureAlerts")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">{t("total")}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-gray-600">{t("critical")}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              <div className="text-sm text-gray-600">{t("warning")}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
              <div className="text-sm text-gray-600">Info</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
              <div className="text-sm text-gray-600">{t("active")}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("searchAlerts")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">{t("critical")}</SelectItem>
                <SelectItem value="warning">{t("warning")}</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Time</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="pondName">Pond</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t("alerts")} ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAlerts.map((alert) => (
                <AlertCard 
                  key={alert._id} 
                  id={alert._id || ""}
                  pond={alert.pondName}
                  parameter={alert.parameter}
                  message={alert.message}
                  severity={alert.severity}
                  timestamp={alert.timestamp}
                  location={alert.location}
                  isActive={alert.isActive}
                  language={language} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("noActiveAlerts")}</p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || severityFilter !== "all" || statusFilter !== "all" 
                  ? t("adjustFilters")
                  : t("noAlertsTriggeredRecently")
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
