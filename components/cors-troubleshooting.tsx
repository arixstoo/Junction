/**
 * 🔧 CORS Troubleshooting Component
 * Helps diagnose and fix CORS issues with the backend API
 */

'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  Server, 
  Shield,
  Copy,
  ExternalLink
} from "lucide-react";

export function CORSTroubleshootingComponent() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'cors-error' | 'network-error' | 'server-error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [backendCode, setBackendCode] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorDetails('');

    try {
      // Test basic connectivity first
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        mode: 'cors',
      });

      if (response.ok) {
        setConnectionStatus('success');
        setErrorDetails('✅ Connection successful! CORS is properly configured.');
      } else {
        setConnectionStatus('server-error');
        setErrorDetails(`❌ Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      
      if (error.message?.includes('CORS') || error.message?.includes('cors')) {
        setConnectionStatus('cors-error');
        setErrorDetails(`❌ CORS Error: ${error.message}`);
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        setConnectionStatus('network-error');
        setErrorDetails(`❌ Network Error: Backend server might not be running on http://localhost:8000`);
      } else {
        setConnectionStatus('server-error');
        setErrorDetails(`❌ Error: ${error.message}`);
      }
    }
  };

  const generateBackendCORSCode = () => {
    const code = `# Backend CORS Configuration Fix

## For FastAPI (Python):
\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Alternative: Allow all origins for development
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
\`\`\`

## For Express.js (Node.js):
\`\`\`javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Alternative: Allow all origins for development
// app.use(cors());
\`\`\`

## For Django (Python):
\`\`\`python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Allow Next.js frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Alternative: Allow all origins for development
# CORS_ALLOW_ALL_ORIGINS = True
\`\`\``;

    setBackendCode(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Wifi className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cors-error':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'network-error':
        return <Server className="h-5 w-5 text-orange-500" />;
      case 'server-error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'cors-error':
        return 'bg-red-100 text-red-800';
      case 'network-error':
        return 'bg-orange-100 text-orange-800';
      case 'server-error':
        return 'bg-red-100 text-red-800';
    }
  };

  useEffect(() => {
    if (connectionStatus === 'cors-error') {
      generateBackendCORSCode();
    }
  }, [connectionStatus]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🔧 CORS Troubleshooting
        </h1>
        <p className="text-gray-600">Diagnose and fix Cross-Origin Resource Sharing (CORS) issues</p>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Connection Test
          </CardTitle>
          <CardDescription>Testing connectivity to http://localhost:8000</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge className={getStatusColor()}>
              {connectionStatus.replace('-', ' ').toUpperCase()}
            </Badge>
            <Button onClick={checkConnection} variant="outline" size="sm">
              Test Again
            </Button>
          </div>
          
          {errorDetails && (
            <Alert variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
              <AlertDescription className="whitespace-pre-wrap">
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* CORS Error Solutions */}
      {connectionStatus === 'cors-error' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              CORS Configuration Required
            </CardTitle>
            <CardDescription>
              Your backend needs CORS headers to allow requests from the frontend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Quick Fix:</strong> Add the CORS configuration below to your backend server and restart it.
              </AlertDescription>
            </Alert>

            {backendCode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Backend CORS Configuration:</h4>
                  <Button 
                    onClick={() => copyToClipboard(backendCode)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
                <Textarea
                  value={backendCode}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Network Error Solutions */}
      {connectionStatus === 'network-error' && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Server className="h-5 w-5" />
              Backend Server Not Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The backend server doesn't appear to be running on http://localhost:8000
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Steps to fix:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Make sure your backend server is running</li>
                <li>Verify it's accessible at <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code></li>
                <li>Check the backend logs for any startup errors</li>
                <li>Try accessing <code className="bg-gray-100 px-1 rounded">http://localhost:8000/health</code> in your browser</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Server Error Solutions */}
      {connectionStatus === 'server-error' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Server Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The backend server is running but returning an error. Check the backend logs for details.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {connectionStatus === 'success' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Connection Successful!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="bg-green-100 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Your backend is properly configured and accessible. You can now use the pond monitoring dashboard!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Additional Help */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <a 
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              MDN CORS Documentation
            </a>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <a 
              href="https://fastapi.tiangolo.com/tutorial/cors/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              FastAPI CORS Guide
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
