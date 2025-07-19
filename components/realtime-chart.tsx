/**
 * 📈 Realtime Chart Component
 * Uses realtime endpoint for live sensor data visualization
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { apiClient, type RealtimeChartData } from '@/lib/api-client';
import { Activity, RefreshCw, Zap, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface RealtimeChartProps {
  pondId: string;
  parameter: string;
  title?: string;
  minutes?: number;
  refreshInterval?: number; // in milliseconds
  height?: number;
  showThresholds?: boolean;
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

export function RealtimeChart({ 
  pondId, 
  parameter,
  title,
  minutes = 60,
  refreshInterval = 10000, // 10 seconds
  height = 300,
  showThresholds = true
}: RealtimeChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [selectedMinutes, setSelectedMinutes] = useState(minutes);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable' | null>(null);

  useEffect(() => {
    loadRealtimeData();
    
    if (isLive) {
      intervalRef.current = setInterval(loadRealtimeData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pondId, parameter, selectedMinutes, isLive, refreshInterval]);

  const loadRealtimeData = async () => {
    try {
      if (loading) setError(null);

      const response = await apiClient.getRealtimeChartData(
        pondId,
        parameter,
        selectedMinutes
      );

      setRealtimeData(response);

      // Transform data for chart
      const transformed = response.data.timestamps.map((timestamp, index) => ({
        time: new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        value: response.data.values[index],
        timestamp: timestamp
      }));

      setChartData(transformed);
      
      // Calculate trend
      if (transformed.length >= 2) {
        const recent = transformed.slice(-5); // Last 5 points
        const older = transformed.slice(-10, -5); // Previous 5 points
        
        if (recent.length > 0 && older.length > 0) {
          const recentAvg = recent.reduce((sum, point) => sum + point.value, 0) / recent.length;
          const olderAvg = older.reduce((sum, point) => sum + point.value, 0) / older.length;
          
          const difference = Math.abs(recentAvg - olderAvg);
          const threshold = olderAvg * 0.02; // 2% threshold for stability
          
          if (difference < threshold) {
            setTrend('stable');
          } else {
            setTrend(recentAvg > olderAvg ? 'up' : 'down');
          }
        }
      }

      if (loading) setLoading(false);

    } catch (err) {
      console.error('Error loading realtime data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load realtime data');
      setLoading(false);
    }
  };

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  const getStatusColor = (value: number | null, thresholds: any) => {
    if (value === null || !thresholds) return 'text-gray-500';
    
    if (thresholds.critical_low !== undefined && value < thresholds.critical_low) return 'text-red-600';
    if (thresholds.critical_high !== undefined && value > thresholds.critical_high) return 'text-red-600';
    if (thresholds.warning_low !== undefined && value < thresholds.warning_low) return 'text-yellow-600';
    if (thresholds.warning_high !== undefined && value > thresholds.warning_high) return 'text-yellow-600';
    
    return 'text-green-600';
  };

  const getParameterColor = () => {
    return PARAMETER_COLORS[parameter as keyof typeof PARAMETER_COLORS] || '#3b82f6';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {title || PARAMETER_NAMES[parameter as keyof typeof PARAMETER_NAMES]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Loading realtime data...</p>
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
            <Zap className="h-5 w-5" />
            {title || PARAMETER_NAMES[parameter as keyof typeof PARAMETER_NAMES]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={loadRealtimeData}>
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
              <Zap className="h-5 w-5" style={{ color: getParameterColor() }} />
              {title || PARAMETER_NAMES[parameter as keyof typeof PARAMETER_NAMES]}
              <Badge variant={isLive ? "default" : "secondary"} className="gap-1">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isLive ? 'LIVE' : 'PAUSED'}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Latest: {safeToFixed(realtimeData?.latest_value)} {realtimeData?.data.unit}
              {getTrendIcon()}
              <span className="text-xs">
                ({realtimeData?.data_points} points, updated {new Date(realtimeData?.last_updated || '').toLocaleTimeString()})
              </span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedMinutes.toString()} onValueChange={(value) => setSelectedMinutes(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="360">6 hours</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant={isLive ? "default" : "outline"} 
              size="sm" 
              onClick={toggleLiveMode}
              className="gap-1"
            >
              <Zap className="h-4 w-4" />
              {isLive ? 'Pause' : 'Live'}
            </Button>
          </div>
        </div>

        {/* Current Value Display */}
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold" style={{ color: getParameterColor() }}>
                {safeToFixed(realtimeData?.latest_value)} 
                <span className="text-sm text-gray-500 ml-1">{realtimeData?.data.unit}</span>
              </p>
              <p className={`text-sm font-medium ${getStatusColor(realtimeData?.latest_value || null, realtimeData?.thresholds)}`}>
                Current Status
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Range</p>
              <p className="text-xs text-gray-500">
                {chartData.length > 0 && (
                  `${safeToFixed(Math.min(...chartData.map(d => d.value)))} - ${safeToFixed(Math.max(...chartData.map(d => d.value)))}`
                )}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                axisLine={false}
                domain={['dataMin - 5%', 'dataMax + 5%']}
              />
              
              {/* Threshold Lines */}
              {showThresholds && realtimeData?.thresholds && (
                <>
                  {realtimeData.thresholds.critical_high && (
                    <ReferenceLine 
                      y={realtimeData.thresholds.critical_high} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label={{ value: "Critical High", position: "top", fontSize: 10 }}
                    />
                  )}
                  {realtimeData.thresholds.warning_high && (
                    <ReferenceLine 
                      y={realtimeData.thresholds.warning_high} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3"
                      label={{ value: "Warning High", position: "top", fontSize: 10 }}
                    />
                  )}
                  {realtimeData.thresholds.warning_low && (
                    <ReferenceLine 
                      y={realtimeData.thresholds.warning_low} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3"
                      label={{ value: "Warning Low", position: "bottom", fontSize: 10 }}
                    />
                  )}
                  {realtimeData.thresholds.critical_low && (
                    <ReferenceLine 
                      y={realtimeData.thresholds.critical_low} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label={{ value: "Critical Low", position: "bottom", fontSize: 10 }}
                    />
                  )}
                </>
              )}

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [
                  `${safeToFixed(value)} ${realtimeData?.data.unit}`, 
                  realtimeData?.data.name
                ]}
              />
              
              <Line
                type="monotone"
                dataKey="value"
                stroke={getParameterColor()}
                strokeWidth={2}
                dot={{ r: 2, fill: getParameterColor() }}
                activeDot={{ r: 4, stroke: getParameterColor(), strokeWidth: 2, fill: 'white' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
