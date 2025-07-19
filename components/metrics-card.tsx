import { Card } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type React from "react"

interface MetricsCardProps {
  title: string
  value: string
  unit: string
  status: "normal" | "warning" | "critical"
  change?: {
    value: string
    percentage: string
    isPositive: boolean
  }
  chart?: React.ReactNode
  language: Language
}

export function MetricsCard({ title, value, unit, status, change, chart, language }: MetricsCardProps) {
  const { t } = useTranslation(language)

  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card className={`p-3 lg:p-4 border-2 ${getStatusColor()} min-h-[100px] lg:min-h-[120px]`}>
      <div className="flex items-center justify-between mb-2 lg:mb-3">
        <h3 className="text-xs lg:text-sm font-medium text-gray-600 truncate pr-2">{title}</h3>
        {status !== "normal" && <AlertTriangle className="h-3 w-3 lg:h-4 lg:w-4 text-current flex-shrink-0" />}
      </div>
      <div className="flex items-end justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <p className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
            <span className="text-xs lg:text-sm text-gray-500 flex-shrink-0">{unit}</span>
          </div>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              {change.isPositive ? (
                <TrendingUp className="h-2 w-2 lg:h-3 lg:w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-2 w-2 lg:h-3 lg:w-3 text-red-500" />
              )}
              <span className="text-xs text-gray-600 truncate">{change.value}</span>
              <span className={`text-xs ${change.isPositive ? "text-green-500" : "text-red-500"}`}>
                {change.percentage}
              </span>
            </div>
          )}
        </div>
        {chart && <div className="flex-shrink-0 ml-2">{chart}</div>}
      </div>
    </Card>
  )
}
