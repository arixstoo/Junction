/**
 * 🔌 WebSocket Hook for Real-time Pond Data
 * Handles WebSocket connections for live sensor data and alerts
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { apiClient, type SensorReading, type Alert, type WebSocketMessage } from '@/lib/api-client';

export interface UseWebSocketReturn {
  sensorData: SensorReading | null;
  alerts: Alert[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function usePondWebSocket(autoConnect: boolean = true): UseWebSocketReturn {
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      setConnectionStatus('connecting');
      
      const ws = apiClient.createWebSocketConnection();
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        console.log('🔌 WebSocket connected to pond monitoring system');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          switch (message.type) {
            case 'sensor_data':
              setSensorData(message.data);
              console.log('📊 New sensor data received:', message.data.pond_id);
              break;
              
            case 'alert':
              setAlerts(prev => [message.data, ...prev.slice(0, 49)]); // Keep last 50 alerts
              console.log('🚨 New alert received:', message.data.severity, message.data.parameter);
              break;
              
            case 'pong':
              console.log('💓 WebSocket heartbeat received');
              break;
              
            default:
              console.log('📨 Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('📴 WebSocket disconnected:', event.code, event.reason);
        wsRef.current = null;
        
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          // Unexpected close, attempt to reconnect
          setConnectionStatus('connecting');
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectDelay);
        } else {
          setConnectionStatus('disconnected');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 1000); // Wait 1 second before reconnecting
  }, [disconnect, connect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      return () => clearInterval(pingInterval);
    }
  }, [connectionStatus]);

  return {
    sensorData,
    alerts,
    connectionStatus,
    lastMessage,
    reconnect,
    disconnect,
  };
}

// Hook for specific pond data
export function usePondData(pondId: string) {
  const { sensorData, alerts } = usePondWebSocket();
  
  const pondSensorData = sensorData?.pond_id === pondId ? sensorData : null;
  const pondAlerts = alerts.filter(alert => alert.pond_id === pondId);
  
  return {
    sensorData: pondSensorData,
    alerts: pondAlerts,
  };
}

// Hook for connection status display
export function useConnectionStatus() {
  const { connectionStatus, reconnect } = usePondWebSocket(false);
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return {
    status: connectionStatus,
    statusColor: getStatusColor(),
    statusText: getStatusText(),
    reconnect,
  };
}
