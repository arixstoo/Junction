export interface PondData {
  _id?: string
  name: string
  location: string
  status: "healthy" | "warning" | "critical"
  parameters: {
    temperature: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    ph: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    oxygen: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    turbidity?: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    nitrate?: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    nitrite?: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    ammonia?: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
    waterLevel?: { value: number; status: "normal" | "warning" | "critical"; timestamp: string }
  }
  alerts: number
  lastUpdate: string
  createdAt: string
  updatedAt: string
}

export interface AlertData {
  _id?: string
  pondId: string
  pondName: string
  parameter: string
  message: string
  severity: "warning" | "critical"
  isActive: boolean
  location: string
  timestamp: string
  resolvedAt?: string
  notificationsSent: {
    sms: boolean
    whatsapp: boolean
    email: boolean
  }
}

export interface RealPondDataPoint {
  pH: string
  Temp: string
  DO: string
  Turbidity: string
  Nitrate: string
  Nitrite: string
  Ammonia: string
  WaterLevel: string
  Status: string
  PondID: string
  Timestamp: string
}

// SYNCHRONIZED DATA SERVICE WITH CONSISTENT ALERTS
export class RealDataService {
  private csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pond_data_with_pondid_timestamp-wjxMdbaXEAfKL4QoX0MGz34XLyRHDf.csv"
  private cachedData: RealPondDataPoint[] | null = null
  private cachedAlerts: AlertData[] | null = null
  private lastFetch = 0
  private cacheTimeout = 2 * 60 * 1000 // 2 minutes

  private async fetchRealData(): Promise<RealPondDataPoint[]> {
    const now = Date.now()

    // Return cached data if still fresh
    if (this.cachedData && now - this.lastFetch < this.cacheTimeout) {
      console.log("📦 Using cached CSV data")
      return this.cachedData
    }

    try {
      console.log("🔄 Fetching fresh CSV data...")
      const response = await fetch(this.csvUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const csvText = await response.text()
      console.log("✅ CSV fetched, size:", csvText.length, "characters")

      // Parse CSV with better error handling
      const lines = csvText.trim().split("\n")
      if (lines.length < 2) {
        throw new Error("CSV file appears to be empty or invalid")
      }

      const headers = lines[0].split(",").map((h) => h.trim())
      console.log("📋 CSV Headers:", headers)

      const data: RealPondDataPoint[] = []
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(",")
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || ""
          })

          // Validate required fields
          if (row.PondID && row.Timestamp && row.Temp && row.pH) {
            data.push(row as RealPondDataPoint)
          }
        } catch (rowError) {
          console.warn(`⚠️ Skipping invalid row ${i}:`, rowError)
        }
      }

      this.cachedData = data
      this.lastFetch = now

      // Clear cached alerts when data refreshes
      this.cachedAlerts = null

      console.log(`✅ Loaded ${data.length} valid records from CSV`)
      return data
    } catch (error) {
      console.error("❌ Error fetching CSV data:", error)
      return []
    }
  }

  // FIXED HISTORICAL DATA METHOD FOR GRAPHS
  async getHistoricalData(
    pondId: string,
    parameter: string,
    timeRange: string,
  ): Promise<Array<{ time: string; value: number; timestamp: Date }>> {
    console.log(`📊 Getting historical data for ${parameter} in ${pondId} (${timeRange})`)

    const realData = await this.fetchRealData()
    if (!realData.length) {
      console.log("❌ No CSV data available")
      return []
    }

    // Extract pond ID from full ID (e.g., "pond-1" -> "1")
    const extractedPondId = pondId.replace("pond-", "")
    console.log(`🔍 Looking for pond ID: ${extractedPondId}`)

    // Filter data for this pond
    const pondData = realData.filter((record) => record.PondID === extractedPondId)
    console.log(`📈 Found ${pondData.length} records for pond ${extractedPondId}`)

    if (!pondData.length) {
      console.log(`❌ No data found for pond ${extractedPondId}`)
      return []
    }

    // Map parameter name to CSV column
    const parameterMap: Record<string, string> = {
      temperature: "Temp",
      ph: "pH",
      oxygen: "DO",
      turbidity: "Turbidity",
      nitrate: "Nitrate",
      nitrite: "Nitrite",
      ammonia: "Ammonia",
      waterLevel: "WaterLevel",
    }

    const csvColumn = parameterMap[parameter]
    if (!csvColumn) {
      console.log(`❌ Unknown parameter: ${parameter}`)
      return []
    }

    console.log(`📊 Mapping ${parameter} to CSV column: ${csvColumn}`)

    // Sort by timestamp
    pondData.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime())

    // Filter by time range
    const now = new Date()
    let startTime = new Date()

    switch (timeRange) {
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "1m":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "3m":
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    // For demo purposes, use all available data if time filtering results in empty set
    let filteredData = pondData.filter((record) => {
      try {
        return new Date(record.Timestamp) >= startTime
      } catch {
        return true // Include if timestamp parsing fails
      }
    })

    // If no data in time range, use last 20 records
    if (filteredData.length === 0) {
      console.log("⚠️ No data in time range, using last 20 records")
      filteredData = pondData.slice(-20)
    }

    console.log(`📊 Processing ${filteredData.length} records for ${parameter}`)

    // Process data points
    const processedData = filteredData.map((record, index) => {
      try {
        const timestamp = new Date(record.Timestamp)
        const rawValue = record[csvColumn as keyof RealPondDataPoint] as string
        const value = Number.parseFloat(rawValue) || 0

        // Format time based on available data
        const timeLabel = timestamp.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })

        return {
          time: timeLabel,
          value: Math.round(value * 100) / 100, // Round to 2 decimal places
          timestamp,
        }
      } catch (error) {
        console.warn(`⚠️ Error processing record ${index}:`, error)
        return {
          time: `Point ${index + 1}`,
          value: 0,
          timestamp: new Date(),
        }
      }
    })

    // Remove invalid data points
    const validData = processedData.filter((point) => !isNaN(point.value) && point.value !== null)

    console.log(`✅ Returning ${validData.length} valid data points for ${parameter}`)
    console.log("📊 Sample data:", validData.slice(0, 3))

    return validData
  }

  private getParameterStatus(value: number, parameter: string): "normal" | "warning" | "critical" {
    switch (parameter) {
      case "temperature":
        if (value > 30) return "critical"
        if (value > 27 || value < 20) return "warning"
        return "normal"
      case "ph":
        if (value > 9 || value < 6) return "critical"
        if (value > 8.5 || value < 6.5) return "warning"
        return "normal"
      case "oxygen":
        if (value < 3) return "critical"
        if (value < 5) return "warning"
        return "normal"
      case "turbidity":
        if (value > 15) return "critical"
        if (value > 10) return "warning"
        return "normal"
      case "nitrate":
        if (value > 50) return "critical"
        if (value > 30) return "warning"
        return "normal"
      case "nitrite":
        if (value > 1) return "critical"
        if (value > 0.5) return "warning"
        return "normal"
      case "ammonia":
        if (value > 2) return "critical"
        if (value > 1) return "warning"
        return "normal"
      default:
        return "normal"
    }
  }

  private getPondOverallStatus(parameters: any): "healthy" | "warning" | "critical" {
    const statuses = Object.values(parameters).map((p: any) => p.status)
    if (statuses.includes("critical")) return "critical"
    if (statuses.includes("warning")) return "warning"
    return "healthy"
  }

  // SYNCHRONIZED ALERT GENERATION - SINGLE SOURCE OF TRUTH
  private async generateAllAlerts(): Promise<AlertData[]> {
    console.log("🚨 Generating synchronized alerts...")

    // Return cached alerts if available
    if (this.cachedAlerts) {
      console.log("📦 Using cached alerts")
      return this.cachedAlerts
    }

    const realData = await this.fetchRealData()
    if (!realData.length) return []

    const allAlerts: AlertData[] = []

    // Group data by pond ID
    const pondGroups = realData.reduce(
      (groups, record) => {
        const pondId = record.PondID
        if (!groups[pondId]) groups[pondId] = []
        groups[pondId].push(record)
        return groups
      },
      {} as Record<string, RealPondDataPoint[]>,
    )

    // Generate alerts for each pond
    Object.entries(pondGroups).forEach(([pondId, pondData]) => {
      const latest = pondData[pondData.length - 1]
      const pondName = `Bassin ${pondId === "1" ? "Alpha" : "Beta"}`
      const location = `Section ${pondId} - ${pondId === "1" ? "Nord" : "Sud"}`

      // Parse all parameters
      const temp = Number.parseFloat(latest.Temp) || 0
      const ph = Number.parseFloat(latest.pH) || 0
      const oxygen = Number.parseFloat(latest.DO) || 0
      const turbidity = Number.parseFloat(latest.Turbidity) || 0
      const nitrate = Number.parseFloat(latest.Nitrate) || 0
      const nitrite = Number.parseFloat(latest.Nitrite) || 0
      const ammonia = Number.parseFloat(latest.Ammonia) || 0

      // Generate alerts based on thresholds
      const alertChecks = [
        {
          parameter: "Température",
          value: temp,
          critical: temp > 30,
          warning: temp > 27 || temp < 20,
          unit: "°C",
          icon: "🌡️",
        },
        {
          parameter: "pH",
          value: ph,
          critical: ph > 9 || ph < 6,
          warning: ph > 8.5 || ph < 6.5,
          unit: "",
          icon: "⚗️",
        },
        {
          parameter: "Oxygène",
          value: oxygen,
          critical: oxygen < 3,
          warning: oxygen < 5,
          unit: "mg/L",
          icon: "💧",
        },
        {
          parameter: "Turbidité",
          value: turbidity,
          critical: turbidity > 15,
          warning: turbidity > 10,
          unit: "NTU",
          icon: "🌊",
        },
        {
          parameter: "Nitrate",
          value: nitrate,
          critical: nitrate > 50,
          warning: nitrate > 30,
          unit: "mg/L",
          icon: "🧪",
        },
        {
          parameter: "Nitrite",
          value: nitrite,
          critical: nitrite > 1,
          warning: nitrite > 0.5,
          unit: "mg/L",
          icon: "🧪",
        },
        {
          parameter: "Ammoniac",
          value: ammonia,
          critical: ammonia > 2,
          warning: ammonia > 1,
          unit: "mg/L",
          icon: "⚠️",
        },
      ]

      alertChecks.forEach((check, index) => {
        if (check.critical) {
          allAlerts.push({
            _id: `alert-${pondId}-${check.parameter.toLowerCase()}-critical`,
            pondId: pondId,
            pondName,
            parameter: check.parameter,
            message: `${check.icon} Niveau critique détecté (${check.value}${check.unit})`,
            severity: "critical",
            isActive: true,
            location,
            timestamp: latest.Timestamp,
            notificationsSent: { sms: true, whatsapp: true, email: true },
          })
        } else if (check.warning) {
          allAlerts.push({
            _id: `alert-${pondId}-${check.parameter.toLowerCase()}-warning`,
            pondId: pondId,
            pondName,
            parameter: check.parameter,
            message: `${check.icon} Niveau d'attention détecté (${check.value}${check.unit})`,
            severity: "warning",
            isActive: true,
            location,
            timestamp: latest.Timestamp,
            notificationsSent: { sms: true, whatsapp: false, email: true },
          })
        }
      })
    })

    // Add some resolved alerts for demo
    const resolvedAlerts: AlertData[] = [
      {
        _id: "alert-resolved-1",
        pondId: "1",
        pondName: "Bassin Alpha",
        parameter: "Température",
        message: "🌡️ Température élevée résolue (26.2°C)",
        severity: "warning",
        isActive: false,
        location: "Section 1 - Nord",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        notificationsSent: { sms: true, whatsapp: true, email: true },
      },
      {
        _id: "alert-resolved-2",
        pondId: "2",
        pondName: "Bassin Beta",
        parameter: "pH",
        message: "⚗️ Niveau de pH normalisé (7.1)",
        severity: "warning",
        isActive: false,
        location: "Section 2 - Sud",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        notificationsSent: { sms: true, whatsapp: false, email: true },
      },
    ]

    const finalAlerts = [...allAlerts, ...resolvedAlerts]

    // Cache the alerts
    this.cachedAlerts = finalAlerts

    console.log(`🚨 Generated ${allAlerts.length} active alerts and ${resolvedAlerts.length} resolved alerts`)
    return finalAlerts
  }

  async getPonds(): Promise<PondData[]> {
    const realData = await this.fetchRealData()
    if (!realData.length) return []

    // Generate all alerts first to ensure synchronization
    const allAlerts = await this.generateAllAlerts()

    // Group data by pond ID
    const pondGroups = realData.reduce(
      (groups, record) => {
        const pondId = record.PondID
        if (!groups[pondId]) groups[pondId] = []
        groups[pondId].push(record)
        return groups
      },
      {} as Record<string, RealPondDataPoint[]>,
    )

    const ponds: PondData[] = []

    Object.entries(pondGroups).forEach(([pondId, pondData]) => {
      // Get latest record for current values
      const latest = pondData[pondData.length - 1]

      const temp = Number.parseFloat(latest.Temp) || 0
      const ph = Number.parseFloat(latest.pH) || 0
      const oxygen = Number.parseFloat(latest.DO) || 0
      const turbidity = Number.parseFloat(latest.Turbidity) || 0
      const nitrate = Number.parseFloat(latest.Nitrate) || 0
      const nitrite = Number.parseFloat(latest.Nitrite) || 0
      const ammonia = Number.parseFloat(latest.Ammonia) || 0
      const waterLevel = Number.parseFloat(latest.WaterLevel) || 0

      const parameters = {
        temperature: {
          value: temp,
          status: this.getParameterStatus(temp, "temperature"),
          timestamp: latest.Timestamp,
        },
        ph: {
          value: ph,
          status: this.getParameterStatus(ph, "ph"),
          timestamp: latest.Timestamp,
        },
        oxygen: {
          value: oxygen,
          status: this.getParameterStatus(oxygen, "oxygen"),
          timestamp: latest.Timestamp,
        },
        turbidity: {
          value: turbidity,
          status: this.getParameterStatus(turbidity, "turbidity"),
          timestamp: latest.Timestamp,
        },
        nitrate: {
          value: nitrate,
          status: this.getParameterStatus(nitrate, "nitrate"),
          timestamp: latest.Timestamp,
        },
        nitrite: {
          value: nitrite,
          status: this.getParameterStatus(nitrite, "nitrite"),
          timestamp: latest.Timestamp,
        },
        ammonia: {
          value: ammonia,
          status: this.getParameterStatus(ammonia, "ammonia"),
          timestamp: latest.Timestamp,
        },
        waterLevel: {
          value: waterLevel,
          status: "normal" as const,
          timestamp: latest.Timestamp,
        },
      }

      const pondName = `Bassin ${pondId === "1" ? "Alpha" : "Beta"}`

      // Count ACTIVE alerts for this pond - SYNCHRONIZED
      const pondActiveAlerts = allAlerts.filter((alert) => alert.pondId === pondId && alert.isActive).length

      ponds.push({
        _id: `pond-${pondId}`,
        name: pondName,
        location: `Section ${pondId} - ${pondId === "1" ? "Nord" : "Sud"}`,
        status: this.getPondOverallStatus(parameters),
        parameters,
        alerts: pondActiveAlerts, // SYNCHRONIZED ALERT COUNT
        lastUpdate: latest.Timestamp,
        createdAt: pondData[0].Timestamp,
        updatedAt: latest.Timestamp,
      })
    })

    console.log(
      `✅ Generated ${ponds.length} ponds with synchronized alert counts:`,
      ponds.map((p) => `${p.name}: ${p.alerts} alerts`),
    )

    return ponds
  }

  async getPondById(id: string): Promise<PondData | null> {
    const ponds = await this.getPonds()
    return ponds.find((pond) => pond._id === id) || null
  }

  // SYNCHRONIZED ACTIVE ALERTS
  async getActiveAlerts(): Promise<AlertData[]> {
    const allAlerts = await this.generateAllAlerts()
    const activeAlerts = allAlerts.filter((alert) => alert.isActive)

    console.log(`🚨 Returning ${activeAlerts.length} active alerts`)
    return activeAlerts
  }

  // SYNCHRONIZED ALL ALERTS
  async getAllAlerts(): Promise<AlertData[]> {
    const allAlerts = await this.generateAllAlerts()

    console.log(`🚨 Returning ${allAlerts.length} total alerts (active + resolved)`)
    return allAlerts
  }

  async createAlert(alert: Omit<AlertData, "_id">): Promise<string> {
    const newId = `alert-${Date.now()}`
    console.log("Created alert:", { ...alert, _id: newId })

    // Clear cached alerts to force refresh
    this.cachedAlerts = null

    return newId
  }

  async resolveAlert(id: string): Promise<void> {
    console.log("Resolved alert:", id)

    // Clear cached alerts to force refresh
    this.cachedAlerts = null
  }

  // Method to force refresh all cached data
  async refreshData(): Promise<void> {
    console.log("🔄 Forcing data refresh...")
    this.cachedData = null
    this.cachedAlerts = null
    this.lastFetch = 0

    // Pre-load fresh data
    await this.fetchRealData()
    await this.generateAllAlerts()

    console.log("✅ Data refreshed successfully")
  }
}

// Export singleton instance
export const dataService = new RealDataService()
