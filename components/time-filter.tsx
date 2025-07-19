"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

export type TimeRange = "24h" | "7d" | "1m" | "3m" | "1y"

interface TimeFilterProps {
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
  language: Language
}

export function TimeFilter({ selectedRange, onRangeChange, language }: TimeFilterProps) {
  const { t } = useTranslation(language)

  const timeRanges: { value: TimeRange; labelKey: string }[] = [
    { value: "24h", labelKey: "24 Heures" },
    { value: "7d", labelKey: "7 Jours" },
    { value: "1m", labelKey: "1 Mois" },
    { value: "3m", labelKey: "3 Mois" },
    { value: "1y", labelKey: "1 An" },
  ]

  const getTimeRangeLabel = (range: TimeRange): string => {
    const labels = {
      "24h": language === "fr" ? "24 Heures" : "24 Hours",
      "7d": language === "fr" ? "7 Jours" : "7 Days",
      "1m": language === "fr" ? "1 Mois" : "1 Month",
      "3m": language === "fr" ? "3 Mois" : "3 Months",
      "1y": language === "fr" ? "1 An" : "1 Year",
    }
    return labels[range]
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t("timeRange")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => onRangeChange(range.value)}
              className={selectedRange === range.value ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent"}
            >
              {getTimeRangeLabel(range.value)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
