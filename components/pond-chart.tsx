"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface PondChartProps {
  parameter: string
  data?: Array<{ time: string; value: number; timestamp?: Date }>
  color?: string
  height?: number
}

export function PondChart({ parameter, data = [], color = "#3b82f6", height = 300 }: PondChartProps) {
  console.log(`🎨 Rendering chart for ${parameter} with ${data?.length || 0} data points`)

  // Show loading state if no data
  if (!data || data.length === 0) {
    return (
      <div
        className={`h-[${height}px] w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading {parameter} data...</p>
        </div>
      </div>
    )
  }

  // Process and validate data
  const chartData = data
    .filter((point) => point && typeof point.value === "number" && !isNaN(point.value))
    .map((point, index) => ({
      time: point.time || `Point ${index + 1}`,
      value: Number(point.value.toFixed(2)),
      originalValue: point.value,
    }))

  console.log(`📊 Chart data processed: ${chartData.length} valid points`)
  console.log(`📊 Sample data:`, chartData.slice(0, 3))

  if (chartData.length === 0) {
    return (
      <div
        className={`h-[${height}px] w-full flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200`}
      >
        <div className="text-center">
          <p className="text-sm text-red-600">No valid data available for {parameter}</p>
        </div>
      </div>
    )
  }

  // Calculate Y-axis domain
  const values = chartData.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = Math.max((maxValue - minValue) * 0.1, 0.1)
  const yAxisDomain = [Math.max(0, minValue - padding), maxValue + padding]

  return (
    <div className={`h-[${height}px] w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            angle={chartData.length > 10 ? -45 : 0}
            textAnchor={chartData.length > 10 ? "end" : "middle"}
            height={chartData.length > 10 ? 60 : 30}
            interval={chartData.length > 15 ? Math.floor(chartData.length / 8) : 0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            domain={yAxisDomain}
            tickFormatter={(value) => Number(value).toFixed(1)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                      {parameter}:{" "}
                      <span className="font-semibold" style={{ color }}>
                        {payload[0].value}
                      </span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: color, strokeWidth: 2, fill: "white" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
