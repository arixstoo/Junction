"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PondDetailModal } from "@/components/pond-detail-modal"
import { PondFilters } from "@/components/pond-filters"
import { useTranslation, type Language } from "@/lib/i18n"
import { dataService, type PondData } from "@/lib/mongodb"
import { 
  Waves, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  Thermometer, 
  Activity, 
  Droplets, 
  Beaker,
  Loader2,
  RefreshCw
} from "lucide-react"

interface PondsPageProps {
  language: Language
}

export function PondsPage({ language }: PondsPageProps) {
  const { t } = useTranslation(language)
  const [ponds, setPonds] = useState<PondData[]>([])
  const [filteredPonds, setFilteredPonds] = useState<PondData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPond, setSelectedPond] = useState<PondData | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadPonds()
  }, [])

  useEffect(() => {
    filterAndSortPonds()
  }, [ponds, searchTerm, sortBy, sortOrder, statusFilter])

  const loadPonds = async () => {
    try {
      setLoading(true)
      const pondsData = await dataService.getPonds()
      setPonds(pondsData)
      console.log(`✅ Loaded ${pondsData.length} ponds`)
    } catch (error) {
      console.error("❌ Error loading ponds:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPonds = () => {
    let filtered = [...ponds]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pond =>
        pond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pond.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(pond => pond.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "location":
          aValue = a.location.toLowerCase()
          bValue = b.location.toLowerCase()
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "lastUpdate":
          aValue = new Date(a.lastUpdate).getTime()
          bValue = new Date(b.lastUpdate).getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredPonds(filtered)
  }

  const getStatusBadge = (status: "normal" | "warning" | "critical" | "healthy") => {
    switch (status) {
      case "normal":
      case "healthy":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t("normal")}</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t("warning")}</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{t("critical")}</Badge>
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString(language === "fr" ? "fr-FR" : "en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const handleViewDetails = (pond: PondData) => {
    setSelectedPond(pond)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">{t("pondsOverview")}</h1>
          <p className="text-gray-600 mt-1">
            {t("monitorAndManage")} ({filteredPonds.length} of {ponds.length})
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPonds}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("loading")}
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            {t("addNewPond")}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("searchPonds")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("search")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("pond")}</SelectItem>
                <SelectItem value="location">{t("location")}</SelectItem>
                <SelectItem value="status">{t("status")}</SelectItem>
                <SelectItem value="lastUpdate">{t("lastUpdated")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="normal">{t("normal")}</SelectItem>
                <SelectItem value="warning">{t("warning")}</SelectItem>
                <SelectItem value="critical">{t("critical")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {t("filter")}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Advanced filters would go here</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ponds Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("pond")}</TableHead>
                  <TableHead>{t("location")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("temperature")}</TableHead>
                  <TableHead>pH</TableHead>
                  <TableHead>{t("oxygenLevel")}</TableHead>
                  <TableHead>{t("lastUpdated")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPonds.map((pond) => (
                  <TableRow key={pond._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Waves className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{pond.name}</div>
                          <div className="text-sm text-gray-500">ID: {pond._id?.slice(-6) || "N/A"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{pond.location}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pond.status)}
                      {pond.status === "critical" && (
                        <AlertTriangle className="inline h-4 w-4 text-red-500 ml-2" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span>{pond.parameters?.temperature?.value?.toFixed(1) || "N/A"}°C</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span>{pond.parameters?.ph?.value?.toFixed(1) || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>{pond.parameters?.oxygen?.value?.toFixed(1) || "N/A"} mg/L</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatTime(pond.lastUpdate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(pond)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {t("viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPonds.length === 0 && (
            <div className="text-center py-8">
              <Waves className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("noPondsFound")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pond Detail Modal */}
      {selectedPond && (
        <PondDetailModal
          pond={selectedPond}
          isOpen={!!selectedPond}
          language={language}
          onClose={() => setSelectedPond(null)}
          alerts={[]}
        />
      )}
    </div>
  )
}
