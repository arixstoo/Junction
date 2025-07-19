"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

interface PondFiltersProps {
  language: Language
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  locationFilter: string
  onLocationFilterChange: (value: string) => void
  alertFilter: string
  onAlertFilterChange: (value: string) => void
  onClearFilters: () => void
  activeFiltersCount: number
}

export function PondFilters({
  language,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
  alertFilter,
  onAlertFilterChange,
  onClearFilters,
  activeFiltersCount,
}: PondFiltersProps) {
  const { t } = useTranslation(language)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Clear Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchPonds")}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={onClearFilters} className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                {t("clear")} ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("status")}</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="healthy">{t("healthy")}</SelectItem>
                  <SelectItem value="warning">{t("warning")}</SelectItem>
                  <SelectItem value="critical">{t("critical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("location")}</label>
              <Select value={locationFilter} onValueChange={onLocationFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("allLocations")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allLocations")}</SelectItem>
                  <SelectItem value="Section A">Section A</SelectItem>
                  <SelectItem value="Section B">Section B</SelectItem>
                  <SelectItem value="Section C">Section C</SelectItem>
                  <SelectItem value="Section D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("alerts")}</label>
              <Select value={alertFilter} onValueChange={onAlertFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("allAlerts")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allAlerts")}</SelectItem>
                  <SelectItem value="with-alerts">{t("withAlerts")}</SelectItem>
                  <SelectItem value="no-alerts">{t("noAlerts")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("parameters")}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("allParameters")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allParameters")}</SelectItem>
                  <SelectItem value="temperature">{t("temperature")}</SelectItem>
                  <SelectItem value="ph">{t("phLevel")}</SelectItem>
                  <SelectItem value="oxygen">{t("oxygenLevel")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  {t("search")}: {searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {t("status")}: {t(statusFilter as any)}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onStatusFilterChange("all")} />
                </Badge>
              )}
              {locationFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {t("location")}: {locationFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onLocationFilterChange("all")} />
                </Badge>
              )}
              {alertFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {t("alerts")}: {alertFilter === "with-alerts" ? t("withAlerts") : t("noAlerts")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onAlertFilterChange("all")} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
