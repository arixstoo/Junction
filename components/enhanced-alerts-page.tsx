/**
 * 🚨 Enhanced Alerts Page with Real-time Updates
 * Uses the backend API for live alert management
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
import { useAlerts } from "@/hooks/use-dashboard";
import { usePondWebSocket } from "@/hooks/use-websocket";
import { AlertTriangle, Check, X, Filter, Search, RefreshCw, Clock, Activity } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface AlertsPageProps {
  language: Language;
}

export function AlertsPage({ language }: AlertsPageProps) {
  const { t } = useTranslation(language);
  const { alerts: apiAlerts, loading, error, refresh, resolveAlert } = useAlerts(30000);
  const { alerts: realtimeAlerts } = usePondWebSocket();
  
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterPond, setFilterPond] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [resolvingAlerts, setResolvingAlerts] = useState<Set<string>>(new Set());

  const allAlerts = apiAlerts?.alerts || [];
  const allRealtimeAlerts = realtimeAlerts || [];

  // Get unique pond IDs for filtering
  const uniquePonds = Array.from(new Set(allAlerts.map(alert => alert.pond_id)));

  // Filter alerts based on current filters
  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesPond = filterPond === "all" || alert.pond_id === filterPond;
    const matchesSearch = searchTerm === "" || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.pond_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesPond && matchesSearch;
  });

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    if (resolvingAlerts.has(alertId)) return;

    setResolvingAlerts(prev => new Set(prev).add(alertId));
    
    try {
      const success = await resolveAlert(alertId);
      if (success) {
        // Alert list will be updated automatically by the refresh in useAlerts
        console.log(`✅ Alert ${alertId} resolved successfully`);
      }
    } catch (error) {
      console.error(`❌ Failed to resolve alert ${alertId}:`, error);
    } finally {
      setResolvingAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading alerts...</p>
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
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Alert Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage pond system alerts</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {apiAlerts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiAlerts.total_active_alerts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{apiAlerts.by_severity.critical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{apiAlerts.by_severity.high}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Medium/Low</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {apiAlerts.by_severity.medium + apiAlerts.by_severity.low}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Alerts */}
      {allRealtimeAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              🔴 Live Alerts
              <Badge variant="destructive">LIVE</Badge>
            </CardTitle>
            <CardDescription className="text-red-600">
              Real-time alerts received via WebSocket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allRealtimeAlerts.slice(0, 3).map((alert, index) => (
              <div key={`live-${index}`} className="flex items-start justify-between p-4 bg-white rounded-lg border border-red-200">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.pond_id}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{alert.parameter}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Just received</p>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pond">Pond</Label>
              <Select value={filterPond} onValueChange={setFilterPond}>
                <SelectTrigger>
                  <SelectValue placeholder="All ponds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ponds</SelectItem>
                  {uniquePonds.map(pondId => (
                    <SelectItem key={pondId} value={pondId}>{pondId}</SelectItem>
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
                  setFilterSeverity("all");
                  setFilterPond("all");
                  setSearchTerm("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Active Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No alerts match your current filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{alert.pond_id}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{alert.parameter}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Value: {alert.current_value}</span>
                          <span>•</span>
                          <span>Threshold: {alert.threshold_value}</span>
                        </div>
                        {alert.sms_sent && (
                          <Badge variant="outline" className="text-xs">
                            SMS Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolvingAlerts.has(alert.id)}
                      className="min-w-[100px]"
                    >
                      {resolvingAlerts.has(alert.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Resolve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
