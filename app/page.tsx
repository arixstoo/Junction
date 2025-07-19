"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsCard } from "@/components/metrics-card"
import { PondChart } from "@/components/pond-chart"
import { PondTable } from "@/components/pond-table"
import { AlertCard } from "@/components/alert-card"
import { Navigation } from "@/components/navigation"
import { PondsPage } from "@/pages/ponds-page"
import { AlertsPage } from "@/pages/alerts-page"
import { SettingsPage } from "@/pages/settings-page"
import { ProfilePage } from "@/pages/profile-page"
import { LoginPage } from "@/pages/login-page"
import { useTranslation, type Language } from "@/lib/i18n"
import { AlertTriangle, Activity, Droplets, Thermometer, Waves, Loader2 } from "lucide-react"
import { dataService, type AlertData, type PondData } from "@/lib/mongodb"
import { generateHistoricalData } from "@/lib/chart-data"

export default function Page() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage("dashboard")
  }

  const handlePageChange = (page: string) => {
    if (page === "login") {
      setIsLoggedIn(false)
    }
    setCurrentPage(page)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} language={language} onLanguageChange={setLanguage} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "ponds":
        return <PondsPage language={language} />
      case "alerts":
        return <AlertsPage language={language} />
      case "settings":
        return <SettingsPage language={language} />
      case "profile":
        return <ProfilePage language={language} />
      default:
        return <DashboardPage language={language} setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile-first navigation */}
        <div className="lg:w-280 lg:flex-shrink-0">
          <Navigation
            currentPage={currentPage}
            onPageChange={handlePageChange}
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>
        {/* Main content with proper mobile spacing */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">{renderPage()}</main>
      </div>
    </div>
  )
}

function DashboardPage({ language, setCurrentPage }: { language: Language; setCurrentPage: (page: string) => void }) {
  const { t } = useTranslation(language)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [ponds, setPonds] = useState<PondData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<{
    temperature: any[]
    ph: any[]
    oxygen: any[]
    turbidity: any[]
  }>({
    temperature: [],
    ph: [],
    oxygen: [],
    turbidity: [],
  })
  const [chartsLoading, setChartsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [language])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log("🔄 Loading dashboard data...")

      const [alertsData, pondsData] = await Promise.all([dataService.getActiveAlerts(), dataService.getPonds()])

      setAlerts(alertsData)
      setPonds(pondsData)
      console.log(`✅ Loaded ${pondsData.length} ponds and ${alertsData.length} alerts`)

      // Load chart data using real data from the first pond
      if (pondsData.length > 0) {
        setChartsLoading(true)
        const firstPond = pondsData[0]
        console.log(`📊 Loading charts for ${firstPond.name}...`)

        try {
          const [temperatureData, phData, oxygenData, turbidityData] = await Promise.all([
            generateHistoricalData(
              firstPond.parameters?.temperature?.value || 0,
              "temperature",
              "24h",
              firstPond._id,
              language,
            ),
            generateHistoricalData(firstPond.parameters?.ph?.value || 0, "ph", "24h", firstPond._id, language),
            generateHistoricalData(firstPond.parameters?.oxygen?.value || 0, "oxygen", "24h", firstPond._id, language),
            generateHistoricalData(
              firstPond.parameters?.turbidity?.value || 0,
              "turbidity",
              "24h",
              firstPond._id,
              language,
            ),
          ])

          console.log("📈 Chart data loaded:", {
            temperature: temperatureData.length,
            ph: phData.length,
            oxygen: oxygenData.length,
            turbidity: turbidityData.length,
          })

          setChartData({
            temperature: temperatureData,
            ph: phData,
            oxygen: oxygenData,
            turbidity: turbidityData,
          })
        } catch (chartError) {
          console.error("❌ Error loading chart data:", chartError)
        } finally {
          setChartsLoading(false)
        }
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (pondId: string) => {
    setCurrentPage("ponds")
  }

  // Calculate averages from real pond data
  const calculateAverages = () => {
    if (ponds.length === 0) {
      return {
        temperature: 0,
        ph: 0,
        oxygen: 0,
        turbidity: 0,
        nitrate: 0,
        ammonia: 0,
      }
    }

    const totals = ponds.reduce(
      (acc, pond) => {
        acc.temperature += pond.parameters?.temperature?.value || 0
        acc.ph += pond.parameters?.ph?.value || 0
        acc.oxygen += pond.parameters?.oxygen?.value || 0
        acc.turbidity += pond.parameters?.turbidity?.value || 0
        acc.nitrate += pond.parameters?.nitrate?.value || 0
        acc.ammonia += pond.parameters?.ammonia?.value || 0
        return acc
      },
      { temperature: 0, ph: 0, oxygen: 0, turbidity: 0, nitrate: 0, ammonia: 0 },
    )

    return {
      temperature: totals.temperature / ponds.length,
      ph: totals.ph / ponds.length,
      oxygen: totals.oxygen / ponds.length,
      turbidity: totals.turbidity / ponds.length,
      nitrate: totals.nitrate / ponds.length,
      ammonia: totals.ammonia / ponds.length,
    }
  }

  const averages = calculateAverages()

  // Determine overall status for each parameter
  const getOverallStatus = (average: number, parameter: string) => {
    switch (parameter) {
      case "temperature":
        if (average > 30) return "critical"
        if (average > 27 || average < 20) return "warning"
        return "normal"
      case "ph":
        if (average > 9 || average < 6) return "critical"
        if (average > 8.5 || average < 6.5) return "warning"
        return "normal"
      case "oxygen":
        if (average < 3) return "critical"
        if (average < 5) return "warning"
        return "normal"
      case "turbidity":
        if (average > 15) return "critical"
        if (average > 10) return "warning"
        return "normal"
      case "nitrate":
        if (average > 50) return "critical"
        if (average > 30) return "warning"
        return "normal"
      case "ammonia":
        if (average > 2) return "critical"
        if (average > 1) return "warning"
        return "normal"
      default:
        return "normal"
    }
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
    <div className="space-y-4 lg:space-y-6 max-w-full">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{t("pondMonitoringDashboard")}</h1>
          <div className="text-sm text-gray-500">
            {t("lastUpdated")}: {new Date().toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US")}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t("liveMode")}</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics - Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <MetricsCard
          title={t("averageTemperature")}
          value={averages.temperature.toFixed(1)}
          unit="°C"
          status={getOverallStatus(averages.temperature, "temperature") as any}
          language={language}
        />
        <MetricsCard
          title={t("averagePH")}
          value={averages.ph.toFixed(1)}
          unit=""
          status={getOverallStatus(averages.ph, "ph") as any}
          language={language}
        />
        <MetricsCard
          title={t("averageOxygen")}
          value={averages.oxygen.toFixed(1)}
          unit={t("mgPerL")}
          status={getOverallStatus(averages.oxygen, "oxygen") as any}
          language={language}
        />
        <MetricsCard
          title={t("averageTurbidity")}
          value={averages.turbidity.toFixed(1)}
          unit={t("ntu")}
          status={getOverallStatus(averages.turbidity, "turbidity") as any}
          language={language}
        />
        <MetricsCard
          title={t("averageNitrate")}
          value={averages.nitrate.toFixed(1)}
          unit={t("mgPerL")}
          status={getOverallStatus(averages.nitrate, "nitrate") as any}
          language={language}
        />
        <MetricsCard
          title={t("activeAlerts")}
          value={alerts.length.toString()}
          unit={language === "fr" ? "alertes" : "alerts"}
          status={alerts.length > 0 ? "critical" : "normal"}
          language={language}
        />
      </div>

      {/* Recent Alerts - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t("recentAlerts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {alerts.slice(0, 4).map((alert) => (
                <AlertCard key={alert._id} {...alert} language={language} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">{t("noActiveAlerts")}</div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Charts - Mobile first */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Thermometer className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
              <span className="truncate">{t("temperatureTrends")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {chartsLoading ? (
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <PondChart
                parameter={`${t("temperature")} (°C)`}
                data={chartData.temperature}
                color="#f97316"
                height={250}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-purple-500" />
              <span className="truncate">{t("phLevel")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {chartsLoading ? (
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <PondChart parameter={t("phLevel")} data={chartData.ph} color="#a855f7" height={250} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Droplets className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
              <span className="truncate">{t("dissolvedOxygen")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {chartsLoading ? (
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <PondChart
                parameter={`${t("oxygenLevel")} (mg/L)`}
                data={chartData.oxygen}
                color="#3b82f6"
                height={250}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Waves className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500" />
              <span className="truncate">{t("turbidity")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {chartsLoading ? (
              <div className="h-[250px] lg:h-[300px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <PondChart
                parameter={`${t("turbidity")} (NTU)`}
                data={chartData.turbidity}
                color="#6b7280"
                height={250}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ponds Overview Table - Mobile optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("pondsOverview")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <PondTable language={language} onViewDetails={handleViewDetails} />
        </CardContent>
      </Card>
    </div>
  )
}
