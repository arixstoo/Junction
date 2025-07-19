import type { TimeRange } from "@/components/time-filter"
import { dataService } from "./mongodb"

export interface ChartDataPoint {
  time: string
  value: number
  timestamp: Date
}

export async function generateHistoricalData(
  currentValue: number,
  parameter: string,
  timeRange: TimeRange,
  pondId?: string,
  language: "en" | "fr" = "en",
): Promise<ChartDataPoint[]> {
  console.log(`🔥 GENERATING CHART DATA: ${parameter} for ${pondId} (${timeRange})`)

  // ALWAYS try to get real data first
  if (pondId) {
    try {
      console.log(`📊 Fetching real data for ${parameter}...`)
      const realData = await dataService.getHistoricalData(pondId, parameter, timeRange)

      if (realData && realData.length > 0) {
        console.log(`✅ SUCCESS! Got ${realData.length} real data points for ${parameter}`)

        // Process and validate the data
        const processedData = realData
          .filter((point) => point && typeof point.value === "number" && !isNaN(point.value))
          .map((point, index) => {
            const timestamp = point.timestamp || new Date()

            // Better time formatting
            let timeLabel: string
            const locale = language === "fr" ? "fr-FR" : "en-US"

            if (timeRange === "24h") {
              timeLabel = timestamp.toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              })
            } else {
              timeLabel = timestamp.toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
              })
            }

            return {
              time: timeLabel,
              value: Number(point.value.toFixed(2)),
              timestamp: timestamp,
            }
          })

        // Sort by timestamp
        processedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

        console.log(`📈 Processed data sample:`, processedData.slice(0, 3))
        return processedData
      } else {
        console.log(`⚠️ No real data returned for ${parameter}`)
      }
    } catch (error) {
      console.error(`❌ Error fetching real data for ${parameter}:`, error)
    }
  }

  // Fallback to generated data
  console.log(`🔄 Using fallback generated data for ${parameter}`)
  return generateFallbackData(currentValue, parameter, timeRange, language)
}

function generateFallbackData(
  currentValue: number,
  parameter: string,
  timeRange: TimeRange,
  language: "en" | "fr",
): ChartDataPoint[] {
  console.log(`🎲 Generating fallback data for ${parameter}`)

  const data: ChartDataPoint[] = []
  const baseValue = currentValue || getDefaultValue(parameter)
  const variance = getParameterVariance(parameter)

  let intervals: number
  let intervalDuration: number

  switch (timeRange) {
    case "24h":
      intervals = 24
      intervalDuration = 60 * 60 * 1000
      break
    case "7d":
      intervals = 14
      intervalDuration = 12 * 60 * 60 * 1000
      break
    default:
      intervals = 20
      intervalDuration = 60 * 60 * 1000
  }

  for (let i = intervals - 1; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * intervalDuration)
    const randomVariation = (Math.random() - 0.5) * variance
    const value = Math.max(0, baseValue + randomVariation)

    const timeLabel = timestamp.toLocaleTimeString(language === "fr" ? "fr-FR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    data.push({
      time: timeLabel,
      value: Math.round(value * 100) / 100,
      timestamp,
    })
  }

  console.log(`✅ Generated ${data.length} fallback data points`)
  return data
}

function getDefaultValue(parameter: string): number {
  switch (parameter) {
    case "temperature":
      return 25
    case "ph":
      return 7.2
    case "oxygen":
      return 6.5
    case "turbidity":
      return 5
    case "nitrate":
      return 20
    case "nitrite":
      return 0.3
    case "ammonia":
      return 0.5
    case "waterLevel":
      return 1.5
    default:
      return 0
  }
}

function getParameterVariance(parameter: string): number {
  switch (parameter) {
    case "temperature":
      return 3
    case "ph":
      return 0.5
    case "oxygen":
      return 2
    case "turbidity":
      return 2
    case "nitrate":
      return 5
    case "nitrite":
      return 0.2
    case "ammonia":
      return 0.3
    case "waterLevel":
      return 0.2
    default:
      return 1
  }
}

export function getTimeRangeLabel(range: TimeRange, language: "en" | "fr"): string {
  const labels = {
    "24h": { en: "Last 24 Hours", fr: "24 Dernières Heures" },
    "7d": { en: "Last 7 Days", fr: "7 Derniers Jours" },
    "1m": { en: "Last Month", fr: "Dernier Mois" },
    "3m": { en: "Last 3 Months", fr: "3 Derniers Mois" },
    "1y": { en: "Last Year", fr: "Dernière Année" },
  }

  return labels[range][language]
}
