/**
 * 🧪 API Integration Test Component
 * Quick test to verify all backend connections are working
 */

'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { usePondWebSocket } from "@/hooks/use-websocket";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Activity, 
  Wifi, 
  Database,
  AlertTriangle
} from "lucide-react";

export function APITestComponent() {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testOutput, setTestOutput] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);
  const { connectionStatus, sensorData, alerts } = usePondWebSocket();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
      setTestOutput(prev => ({ ...prev, [testName]: result }));
      return result;
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
      setTestOutput(prev => ({ ...prev, [testName]: error }));
      throw error;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});
    setTestOutput({});

    try {
      // Test 1: Health Check
      await runTest('health', () => apiClient.getHealthCheck());

      // Test 2: Login
      await runTest('login', () => apiClient.login('admin', 'secret'));

      // Test 3: Dashboard Overview
      await runTest('dashboard', () => apiClient.getDashboardOverview());

      // Test 4: Active Alerts
      await runTest('alerts', () => apiClient.getActiveAlerts());

      // Test 5: System Status
      await runTest('system', () => apiClient.getSystemStatus());

      // Test 6: Pond Data (if ponds available)
      const dashboard = testOutput.dashboard;
      if (dashboard?.ponds?.length > 0) {
        const pondId = dashboard.ponds[0].pond_id;
        await runTest('pondLatest', () => apiClient.getLatestPondData(pondId));
        await runTest('pondHistory', () => apiClient.getPondHistory(pondId, 1));
      }

    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧪 API Integration Test</h1>
          <p className="text-gray-600">Verify backend API connectivity and functionality</p>
        </div>
        <Button onClick={runAllTests} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {/* WebSocket Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WebSocket Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {connectionStatus.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {connectionStatus === 'connected' && 'Real-time data active'}
                {connectionStatus === 'connecting' && 'Establishing connection...'}
                {connectionStatus === 'disconnected' && 'Not connected to WebSocket'}
                {connectionStatus === 'error' && 'Connection error'}
              </p>
            </div>
            {sensorData && (
              <div className="text-right">
                <p className="text-sm font-medium">Latest Data: {sensorData.pond_id}</p>
                <p className="text-xs text-gray-500">
                  {new Date(sensorData.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Live Alerts Received: {alerts.length}</p>
              <div className="space-y-1">
                {alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="text-xs bg-red-50 p-2 rounded">
                    <span className="font-medium">{alert.pond_id}</span> - {alert.parameter}: {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            API Endpoint Tests
          </CardTitle>
          <CardDescription>
            Testing connectivity to all backend endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Health Check */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.health)}
                <div>
                  <p className="font-medium">Health Check</p>
                  <p className="text-sm text-gray-600">GET /health</p>
                </div>
              </div>
              {testResults.health && (
                <Badge className={getStatusColor(testResults.health)}>
                  {testResults.health}
                </Badge>
              )}
            </div>

            {/* Authentication */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.login)}
                <div>
                  <p className="font-medium">Authentication</p>
                  <p className="text-sm text-gray-600">POST /auth/login</p>
                </div>
              </div>
              {testResults.login && (
                <Badge className={getStatusColor(testResults.login)}>
                  {testResults.login}
                </Badge>
              )}
            </div>

            {/* Dashboard */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.dashboard)}
                <div>
                  <p className="font-medium">Dashboard Overview</p>
                  <p className="text-sm text-gray-600">GET /mvp/dashboard/overview</p>
                </div>
              </div>
              {testResults.dashboard && (
                <Badge className={getStatusColor(testResults.dashboard)}>
                  {testResults.dashboard}
                </Badge>
              )}
            </div>

            {/* Alerts */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.alerts)}
                <div>
                  <p className="font-medium">Active Alerts</p>
                  <p className="text-sm text-gray-600">GET /mvp/alerts/active</p>
                </div>
              </div>
              {testResults.alerts && (
                <Badge className={getStatusColor(testResults.alerts)}>
                  {testResults.alerts}
                </Badge>
              )}
            </div>

            {/* System Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.system)}
                <div>
                  <p className="font-medium">System Status</p>
                  <p className="text-sm text-gray-600">GET /mvp/system/status</p>
                </div>
              </div>
              {testResults.system && (
                <Badge className={getStatusColor(testResults.system)}>
                  {testResults.system}
                </Badge>
              )}
            </div>

            {/* Pond Data */}
            {testResults.pondLatest && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults.pondLatest)}
                  <div>
                    <p className="font-medium">Pond Latest Data</p>
                    <p className="text-sm text-gray-600">GET /mvp/pond/{'{id}'}/latest</p>
                  </div>
                </div>
                <Badge className={getStatusColor(testResults.pondLatest)}>
                  {testResults.pondLatest}
                </Badge>
              </div>
            )}

            {testResults.pondHistory && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults.pondHistory)}
                  <div>
                    <p className="font-medium">Pond History</p>
                    <p className="text-sm text-gray-600">GET /mvp/pond/{'{id}'}/history</p>
                  </div>
                </div>
                <Badge className={getStatusColor(testResults.pondHistory)}>
                  {testResults.pondHistory}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Output */}
      {Object.keys(testOutput).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Output Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testOutput.dashboard && testResults.dashboard === 'success' && (
                <div>
                  <h4 className="font-medium mb-2">Dashboard Data:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Ponds</p>
                      <p className="font-bold">{testOutput.dashboard.summary?.total_ponds}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Active Alerts</p>
                      <p className="font-bold">{testOutput.dashboard.summary?.active_alerts}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Readings</p>
                      <p className="font-bold">{testOutput.dashboard.summary?.total_readings}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">WebSocket Connections</p>
                      <p className="font-bold">{testOutput.dashboard.websocket_connections}</p>
                    </div>
                  </div>
                </div>
              )}

              {testOutput.alerts && testResults.alerts === 'success' && (
                <div>
                  <h4 className="font-medium mb-2">Active Alerts:</h4>
                  <p className="text-sm text-gray-600">
                    {testOutput.alerts.total_active_alerts} total alerts
                    {testOutput.alerts.by_severity && (
                      <span> (Critical: {testOutput.alerts.by_severity.critical}, High: {testOutput.alerts.by_severity.high})</span>
                    )}
                  </p>
                </div>
              )}

              {testOutput.system && testResults.system === 'success' && (
                <div>
                  <h4 className="font-medium mb-2">System Status:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">System</p>
                      <p className="font-bold">{testOutput.system.system_status}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Database</p>
                      <p className="font-bold">{testOutput.system.database}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">SMS Service</p>
                      <p className="font-bold">{testOutput.system.sms_service}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Before testing:</strong> Ensure the backend API is running on localhost:8000 with sample data loaded.
          Use credentials: admin/secret
        </AlertDescription>
      </Alert>
    </div>
  );
}
