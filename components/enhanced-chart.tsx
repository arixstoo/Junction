/**
 * 📊 Enhanced Chart Component
 * Uses new backend chart data endpoints for better performance and data
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient, type ChartDataParameter } from '@/lib/api-client';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Calendar, BarChart3 } from 'lucide-react';

interface EnhancedChartProps {
  pondId: string;
  title?: string;
  defaultParameters?: string[];
  defaultHours?: number;
  height?: number;
  showControls?: boolean;
  realtime?: boolean;
}

// Utility function to safely format numbers
const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
};

const PARAMETER_COLORS = {
  temperature: '#f97316',
  ph: '#a855f7',
  dissolved_oxygen: '#3b82f6',
  water_level: '#06b6d4',
  turbidity: '#6b7280',
  nitrate: '#10b981',
  nitrite: '#f59e0b',
  ammonia: '#ef4444'
};

const PARAMETER_NAMES = {
  temperature: 'Temperature',
  ph: 'pH Level',
  dissolved_oxygen: 'Dissolved Oxygen',
  water_level: 'Water Level',
  turbidity: 'Turbidity',
  nitrate: 'Nitrate',
  nitrite: 'Nitrite',
  ammonia: 'Ammonia'
};

export function EnhancedChart({ 
  pondId, 
  title = "Sensor Data",
  defaultParameters = ['temperature', 'ph'],
  defaultHours = 24,
  height = 400,
  showControls = true,
  realtime = false
}: EnhancedChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [parameters, setParameters] = useState<string[]>(defaultParameters);
  const [hours, setHours] = useState(defaultHours);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, ChartDataParameter['stats']>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadChartData();
    
    // Auto-refresh for realtime charts
    if (realtime) {
      const interval = setInterval(loadChartData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [pondId, parameters, hours, realtime]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getPondChartData(
        pondId,
        hours,
        parameters.join(',')
      );

      // Transform the data for the chart
      const transformedData = transformChartData(response.chart_data);
      setChartData(transformedData);
      
      // Extract stats for each parameter
      const paramStats: Record<string, ChartDataParameter['stats']> = {};
      Object.entries(response.chart_data).forEach(([param, data]) => {
        paramStats[param] = data.stats;
      });
      setStats(paramStats);
      setLastUpdated(new Date());

      console.log(`📊 Loaded chart data for ${pondId}:`, {
        parameters: Object.keys(response.chart_data),
        totalPoints: response.metadata.total_points
      });

    } catch (err) {
      console.error('Error loading chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const transformChartData = (chartData: Record<string, ChartDataParameter>) => {
    // Find the parameter with the most data points to use as base
    const paramEntries = Object.entries(chartData);
    if (paramEntries.length === 0) return [];

    const baseParam = paramEntries.reduce((longest, current) => 
      current[1].labels.length > longest[1].labels.length ? current : longest
    );

    // Create chart data points
    const data = baseParam[1].labels.map((label, index) => {
      const point: any = { time: label };
      
      // Add values for each parameter at this time point
      paramEntries.forEach(([paramName, paramData]) => {
        if (paramData.values[index] !== undefined) {
          point[paramName] = paramData.values[index];
        }
      });
      
      return point;
    });

    return data;
  };

  const handleParameterChange = (newParams: string[]) => {
    setParameters(newParams);
  };

  const handleTimeRangeChange = (newHours: number) => {
    setHours(newHours);
  };

  const getParameterTrend = (param: string) => {
    const paramStats = stats[param];
    if (!paramStats || !paramStats.latest || !paramStats.avg) return null;

    const isIncreasing = paramStats.latest > paramStats.avg;
    return isIncreasing ? 'up' : 'down';
  };

  if (loading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={loadChartData}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {title}
              {realtime && <Badge variant="outline" className="text-green-600">Live</Badge>}
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadChartData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Parameter Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {parameters.map(param => {
            const paramStats = stats[param];
            const trend = getParameterTrend(param);
            
            return (
              <div key={param} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PARAMETER_COLORS[param as keyof typeof PARAMETER_COLORS] }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {PARAMETER_NAMES[param as keyof typeof PARAMETER_NAMES]}
                  </span>
                  {trend && (
                    trend === 'up' ? 
                      <TrendingUp className="h-3 w-3 text-green-500" /> : 
                      <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <p className="text-lg font-bold">
                  {safeToFixed(paramStats?.latest, 1)}
                </p>
                <p className="text-xs text-gray-500">
                  Avg: {safeToFixed(paramStats?.avg, 1)}
                </p>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Time Range Controls */}
        {showControls && (
          <div className="flex items-center gap-4 mb-4">
            <Select value={hours.toString()} onValueChange={(value) => handleTimeRangeChange(Number(value))}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last Hour</SelectItem>
                <SelectItem value="6">Last 6 Hours</SelectItem>
                <SelectItem value="24">Last 24 Hours</SelectItem>
                <SelectItem value="72">Last 3 Days</SelectItem>
                <SelectItem value="168">Last Week</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600">
              {chartData.length} data points
            </div>
          </div>
        )}

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              
              {parameters.map(param => (
                <Line
                  key={param}
                  type="monotone"
                  dataKey={param}
                  stroke={PARAMETER_COLORS[param as keyof typeof PARAMETER_COLORS]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name={PARAMETER_NAMES[param as keyof typeof PARAMETER_NAMES]}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
