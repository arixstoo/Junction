/**
 * 📊 Enhanced Dashboard Component with Real-time Data
 * Uses the backend API for live pond monitoring
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectionStatus } from "@/components/connection-status";
import { EnhancedChart } from "@/components/enhanced-chart";
import { RealtimeChart } from "@/components/realtime-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePondWebSocket, useConnectionStatus } from "@/hooks/use-websocket";
import { useTranslation, type Language } from "@/lib/i18n";
import { AlertTriangle, Activity, Droplets, Thermometer, Zap, RefreshCw, Wifi, WifiOff } from "lucide-react";

// Utility function to safely format numbers
const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
};

interface DashboardComponentProps {
  language?: string;
}

export function DashboardComponent({ language = 'en' }: DashboardComponentProps) {
  const { t } = useTranslation(language as Language);
  const { overview, activeAlerts, systemStatus, loading, error, refresh } = useDashboard(30000);
  const { sensorData, alerts: realtimeAlerts } = usePondWebSocket();
  const { status: connectionStatus, statusColor, statusText, reconnect } = useConnectionStatus();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={refresh} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Connection Status Banner */}
      <ConnectionStatus />
      
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌊 Pond Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time aquaculture monitoring system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <Wifi className={`h-4 w-4 ${statusColor}`} />
            ) : (
              <WifiOff className={`h-4 w-4 ${statusColor}`} />
            )}
            <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
            {connectionStatus !== 'connected' && (
              <Button variant="outline" size="sm" onClick={reconnect}>
                Reconnect
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ponds</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.summary.total_ponds}</div>
              <p className="text-xs text-muted-foreground">
                {overview.summary.active_ponds} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.summary.total_readings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.summary.active_alerts}</div>
              <p className="text-xs text-muted-foreground">
                {overview.summary.critical_alerts} critical
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStatus?.system_status === 'operational' ? '✅' : '⚠️'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStatus?.system_status || 'Loading...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ponds Grid */}
      {overview?.ponds && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pond Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overview.ponds.map((pond) => (
              <Card key={pond.pond_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pond.pond_id}</CardTitle>
                    <Badge className={getStatusColor(pond.status)}>
                      {pond.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Last update: {new Date(pond.latest_reading.timestamp).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <p className="text-lg font-bold">
                        {safeToFixed(pond.latest_reading.temperature, 1)}°C
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">pH</span>
                      </div>
                      <p className="text-lg font-bold">
                        {safeToFixed(pond.latest_reading.ph, 2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm font-medium">DO</span>
                      </div>
                      <p className="text-lg font-bold">
                        {safeToFixed(pond.latest_reading.dissolved_oxygen, 2)} mg/L
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Level</span>
                      </div>
                      <p className="text-lg font-bold">
                        {safeToFixed(pond.latest_reading.water_level, 2)}m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Data Display */}
      {sensorData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🔴 Live Data - {sensorData.pond_id}</CardTitle>
            <CardDescription className="text-green-600">
              Real-time sensor reading received at {new Date(sensorData.timestamp).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-green-600">Temperature</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.temperature, 1)}°C
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">pH</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.ph, 2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">Dissolved Oxygen</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.dissolved_oxygen, 2)} mg/L
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">Water Level</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.water_level, 2)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {activeAlerts && activeAlerts.alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          <div className="space-y-3">
            {activeAlerts.alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} variant="default" className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <div className="flex items-center justify-between w-full">
                  <div>
                    <AlertDescription className="font-medium">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="ml-2">{alert.pond_id} - {alert.parameter}</span>
                    </AlertDescription>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Alert>
            ))}
            {activeAlerts.alerts.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                And {activeAlerts.alerts.length - 5} more alerts...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Real-time Alerts */}
      {realtimeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🚨 Recent Alerts (Live)</h2>
          <div className="space-y-3">
            {realtimeAlerts.slice(0, 3).map((alert, index) => (
              <Alert key={`realtime-${index}`} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="ml-2 font-medium">{alert.pond_id} - {alert.parameter}</span>
                  <p className="mt-1">{alert.message}</p>
                  <p className="text-xs mt-1">Just received via WebSocket</p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Database</p>
                <p className={systemStatus.database === 'connected' ? 'text-green-600' : 'text-red-600'}>
                  {systemStatus.database}
                </p>
              </div>
              <div>
                <p className="font-medium">SMS Service</p>
                <p className={systemStatus.sms_service === 'enabled' ? 'text-green-600' : 'text-yellow-600'}>
                  {systemStatus.sms_service}
                </p>
              </div>
              <div>
                <p className="font-medium">WebSocket Connections</p>
                <p className="text-blue-600">{systemStatus.websocket_connections}</p>
              </div>
              <div>
                <p className="font-medium">Last Data</p>
                <p className="text-gray-600">
                  {new Date(systemStatus.last_data_received).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Charts Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">{t("enhancedAnalytics")}</h2>
        
        {/* Multi-parameter Chart */}
        <EnhancedChart
          pondId="pond_001"
          title="Multi-Parameter Analysis"
          defaultParameters={['temperature', 'ph', 'dissolved_oxygen']}
          defaultHours={24}
          height={400}
          showControls={true}
        />

        {/* Realtime Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealtimeChart
            pondId="pond_001"
            parameter="temperature"
            title="Live Temperature"
            minutes={60}
            height={250}
            showThresholds={true}
          />
          
          <RealtimeChart
            pondId="pond_001"
            parameter="ph"
            title="Live pH Monitoring"
            minutes={60}
            height={250}
            showThresholds={true}
          />
          
          <RealtimeChart
            pondId="pond_001"
            parameter="dissolved_oxygen"
            title="Live Oxygen Levels"
            minutes={60}
            height={250}
            showThresholds={true}
          />
          
          <RealtimeChart
            pondId="pond_001"
            parameter="water_level"
            title="Live Water Level"
            minutes={60}
            height={250}
            showThresholds={true}
          />
        </div>

        {/* Long-term Trends */}
        <EnhancedChart
          pondId="pond_001"
          title="Long-term Trends (7 Days)"
          defaultParameters={['temperature', 'ph']}
          defaultHours={168}
          height={350}
          showControls={true}
        />
      </div>
    </div>
  );
}
