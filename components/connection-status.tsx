/**
 * 🔗 Connection Status Component
 * Displays backend connection status and quick fixes
 */

'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface ConnectionStatusProps {
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'error') => void;
}

export function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'cors-error' | 'network-error' | 'server-error'>('checking');
  const [lastError, setLastError] = useState<string>('');

  const checkConnection = async () => {
    setStatus('checking');
    setLastError('');

    try {
      const isConnected = await apiClient.testConnection();
      if (isConnected) {
        setStatus('connected');
        onConnectionChange?.('connected');
      } else {
        setStatus('server-error');
        onConnectionChange?.('error');
      }
    } catch (error: any) {
      console.error('Connection check failed:', error);
      setLastError(error.message || 'Unknown error');
      
      if (error.message?.toLowerCase().includes('cors')) {
        setStatus('cors-error');
      } else if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('fetch')) {
        setStatus('network-error');
      } else {
        setStatus('server-error');
      }
      
      onConnectionChange?.('error');
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'connected':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'connected':
        return 'Connected';
      case 'cors-error':
        return 'CORS Error';
      case 'network-error':
        return 'Backend Offline';
      case 'server-error':
        return 'Server Error';
    }
  };

  if (status === 'connected') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
              <span className="text-sm text-green-700">Backend API is accessible</span>
            </div>
            <Button onClick={checkConnection} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          {getStatusIcon()}
          Connection Issue Detected
        </CardTitle>
        <CardDescription>
          Unable to connect to the backend API at http://localhost:8000
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          <Button onClick={checkConnection} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>

        {lastError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {lastError}
            </AlertDescription>
          </Alert>
        )}

        {status === 'cors-error' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>CORS Issue:</strong> Your backend needs CORS configuration to allow frontend requests.
              <br />
              <a 
                href="/cors" 
                className="text-blue-600 hover:underline flex items-center gap-1 mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#cors';
                  window.location.reload();
                }}
              >
                <ExternalLink className="h-3 w-3" />
                Open CORS Fix Guide
              </a>
            </AlertDescription>
          </Alert>
        )}

        {status === 'network-error' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Backend Not Running:</strong> Make sure your backend server is running on http://localhost:8000
              <br />
              <span className="text-sm text-gray-600">Try visiting http://localhost:8000/health in your browser</span>
            </AlertDescription>
          </Alert>
        )}

        {status === 'server-error' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Server Error:</strong> The backend is running but returning an error.
              <br />
              <span className="text-sm text-gray-600">Check your backend logs for details</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
