/**
 * 🌊 Enhanced Ponds Page with Real-time Data
 * Uses the backend API for live pond monitoring
 */

'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedChart } from "@/components/enhanced-chart";
import { RealtimeChart } from "@/components/realtime-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import { usePondWebSocket } from "@/hooks/use-websocket";
import { apiClient } from "@/lib/api-client";

// Utility function to safely format numbers
const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
};

import { 
  Droplets, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Filter, 
  Search, 
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface PondsPageProps {
  language: Language;
}

export function PondsPage({ language }: PondsPageProps) {
  const { t } = useTranslation(language);
  const { overview, loading, error, refresh } = useDashboard(60000);
  const { sensorData } = usePondWebSocket();
  
  const [selectedPond, setSelectedPond] = useState<string>("pond_001");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPondHistory, setSelectedPondHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const ponds = overview?.ponds || [];
  
  // Filter ponds based on current filters
  const filteredPonds = ponds.filter(pond => {
    const matchesPond = selectedPond === "all" || pond.pond_id === selectedPond;
    const matchesSearch = searchTerm === "" || 
      pond.pond_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPond && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getParameterStatus = (value: number | null | undefined, parameter: string) => {
    // Handle null/undefined values
    if (value === null || value === undefined || isNaN(value)) {
      return 'normal'; // Default to normal for missing values
    }
    
    // Simple thresholds for demonstration
    switch (parameter) {
      case 'temperature':
        if (value < 18 || value > 32) return 'critical';
        if (value < 20 || value > 30) return 'warning';
        return 'normal';
      case 'ph':
        if (value < 6.5 || value > 8.5) return 'critical';
        if (value < 7.0 || value > 8.0) return 'warning';
        return 'normal';
      case 'dissolved_oxygen':
        if (value < 4) return 'critical';
        if (value < 5) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getParameterColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'normal':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const loadPondHistory = async (pondId: string) => {
    setHistoryLoading(true);
    try {
      const history = await apiClient.getPondHistory(pondId, 6); // Last 6 hours
      setSelectedPondHistory(history);
    } catch (error) {
      console.error('Failed to load pond history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading pond data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={refresh} className="ml-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            Pond Monitoring
          </h1>
          <p className="text-gray-600 mt-1">Monitor individual pond conditions and parameters</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Ponds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.summary.total_ponds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Ponds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overview.summary.active_ponds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.summary.total_readings.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overview.summary.active_alerts}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Update */}
      {sensorData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              🔴 Live Update - {sensorData.pond_id}
              <Badge variant="outline" className="bg-green-100 text-green-800">LIVE</Badge>
            </CardTitle>
            <CardDescription className="text-green-600">
              Real-time data received at {new Date(sensorData.timestamp).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Temperature</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.temperature, 1)}°C
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">pH</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.ph, 2)}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Droplets className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Dissolved Oxygen</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.dissolved_oxygen, 2)} mg/L
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Activity className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Water Level</p>
                <p className="text-xl font-bold text-green-800">
                  {safeToFixed(sensorData.water_level, 2)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Ponds</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by pond ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pond">Select Pond</Label>
              <Select value={selectedPond} onValueChange={setSelectedPond}>
                <SelectTrigger>
                  <SelectValue placeholder="All ponds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ponds</SelectItem>
                  {ponds.map(pond => (
                    <SelectItem key={pond.pond_id} value={pond.pond_id}>
                      {pond.pond_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedPond("all");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ponds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPonds.map((pond) => (
          <Card key={pond.pond_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pond.pond_id}</CardTitle>
                <Badge className={getStatusColor(pond.status)}>
                  {pond.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last update: {new Date(pond.latest_reading.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parameters Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${getParameterColor(getParameterStatus(pond.latest_reading.temperature, 'temperature'))}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Temperature</span>
                    <Thermometer className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {safeToFixed(pond.latest_reading.temperature, 1)}°C
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg ${getParameterColor(getParameterStatus(pond.latest_reading.ph, 'ph'))}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">pH</span>
                    <Activity className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {safeToFixed(pond.latest_reading.ph, 2)}
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg ${getParameterColor(getParameterStatus(pond.latest_reading.dissolved_oxygen, 'dissolved_oxygen'))}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">DO</span>
                    <Droplets className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {safeToFixed(pond.latest_reading.dissolved_oxygen, 2)} mg/L
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-gray-50 text-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Level</span>
                    <Activity className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {safeToFixed(pond.latest_reading.water_level, 2)}m
                  </p>
                </div>
              </div>

              {/* Additional Parameters */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-gray-500">Turbidity</p>
                  <p className="font-medium">{safeToFixed(pond.latest_reading.turbidity, 1)} NTU</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Ammonia</p>
                  <p className="font-medium">{safeToFixed(pond.latest_reading.ammonia, 3)} mg/L</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Nitrate</p>
                  <p className="font-medium">{safeToFixed(pond.latest_reading.nitrate, 1)} mg/L</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => loadPondHistory(pond.pond_id)}
                  disabled={historyLoading}
                >
                  {historyLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-1" />
                      History
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History Modal/Section */}
      {selectedPondHistory && (
        <Card>
          <CardHeader>
            <CardTitle>
              Historical Data - {selectedPondHistory.pond_id}
            </CardTitle>
            <CardDescription>
              Last {selectedPondHistory.period_hours} hours • {selectedPondHistory.total_readings} readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Showing recent readings:</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedPondHistory(null)}
                >
                  Close
                </Button>
              </div>
              
              {/* Simple history table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">pH</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">DO</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedPondHistory.readings.slice(0, 10).map((reading: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 text-sm">{safeToFixed(reading.temperature, 1)}°C</td>
                        <td className="px-3 py-2 text-sm">{safeToFixed(reading.ph, 2)}</td>
                        <td className="px-3 py-2 text-sm">{safeToFixed(reading.dissolved_oxygen, 2)}</td>
                        <td className="px-3 py-2 text-sm">{safeToFixed(reading.water_level, 2)}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPonds.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No ponds match your current filters</p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Analytics Section */}
      {filteredPonds.length > 0 && (
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Advanced Analytics</h2>
            <Select value={selectedPond} onValueChange={setSelectedPond}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select pond for charts" />
              </SelectTrigger>
              <SelectContent>
                {overview?.ponds.map((pond) => (
                  <SelectItem key={pond.pond_id} value={pond.pond_id}>
                    {pond.pond_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPond && (
            <>
              {/* Realtime Monitoring Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealtimeChart
                  pondId={selectedPond}
                  parameter="temperature"
                  title="Live Temperature Monitoring"
                  minutes={30}
                  height={200}
                  showThresholds={true}
                />
                
                <RealtimeChart
                  pondId={selectedPond}
                  parameter="ph"
                  title="Live pH Monitoring"
                  minutes={30}
                  height={200}
                  showThresholds={true}
                />
              </div>

              {/* Comprehensive Analysis */}
              <EnhancedChart
                pondId={selectedPond}
                title="Multi-Parameter Analysis"
                defaultParameters={['temperature', 'ph', 'dissolved_oxygen', 'water_level']}
                defaultHours={24}
                height={400}
                showControls={true}
              />

              {/* Water Quality Focus */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedChart
                  pondId={selectedPond}
                  title="Water Quality Indicators"
                  defaultParameters={['ph', 'dissolved_oxygen', 'turbidity']}
                  defaultHours={12}
                  height={300}
                  showControls={true}
                />

                <EnhancedChart
                  pondId={selectedPond}
                  title="Chemical Levels"
                  defaultParameters={['nitrate', 'nitrite', 'ammonia']}
                  defaultHours={12}
                  height={300}
                  showControls={true}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
