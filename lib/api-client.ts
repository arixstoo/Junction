/**
 * 🌊 Pond Monitoring API Client
 * Handles all API calls to the backend MVP API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Types based on the API documentation
export interface SensorReading {
  pond_id: string;
  device_id: string;
  timestamp: string;
  ph: number;
  temperature: number;
  dissolved_oxygen: number;
  turbidity: number;
  nitrate: number;
  nitrite: number;
  ammonia: number;
  water_level: number;
  created_at: string;
  id: string;
}

export interface Alert {
  id: string;
  pond_id: string;
  alert_type: string;
  parameter: string;
  current_value: number;
  threshold_value: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  is_resolved: boolean;
  sms_sent: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface PondSummary {
  pond_id: string;
  status: string;
  latest_reading: SensorReading;
}

export interface DashboardOverview {
  summary: {
    total_ponds: number;
    active_ponds: number;
    total_readings: number;
    active_alerts: number;
    critical_alerts: number;
  };
  ponds: PondSummary[];
  alert_statistics: {
    total_alerts: number;
    by_severity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    by_parameter: Record<string, number>;
    active_alerts: number;
    period_days: number;
  };
  websocket_connections: number;
}

export interface PondLatestData {
  pond_id: string;
  latest_reading: SensorReading;
  active_alerts: number;
  status: string;
  last_updated: string;
}

export interface PondHistory {
  pond_id: string;
  period_hours: number;
  total_readings: number;
  readings: SensorReading[];
}

export interface PondAlerts {
  pond_id: string;
  alerts: Alert[];
  statistics: {
    total_alerts: number;
    by_severity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    active_alerts: number;
    period_days: number;
  };
  total_returned: number;
}

export interface ChartDataParameter {
  labels: string[];
  values: number[];
  unit: string;
  name: string;
  stats: {
    min: number | null;
    max: number | null;
    avg: number | null;
    latest: number | null;
    count: number;
  };
}

export interface PondChartData {
  pond_id: string;
  period_hours: number;
  parameters: string[];
  chart_data: Record<string, ChartDataParameter>;
  metadata: {
    total_points: number;
    start_time: string;
    end_time: string;
    available_parameters: string[];
  };
}

export interface RealtimeChartData {
  pond_id: string;
  parameter: string;
  period_minutes: number;
  data: {
    timestamps: string[];
    values: number[];
    unit: string;
    name: string;
  };
  thresholds: {
    warning_low?: number;
    warning_high?: number;
    critical_low?: number;
    critical_high?: number;
  };
  latest_value: number | null;
  data_points: number;
  last_updated: string;
}

export interface ActiveAlerts {
  total_active_alerts: number;
  alerts: Alert[];
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SystemStatus {
  system_status: string;
  database: string;
  sms_service: string;
  websocket_connections: number;
  last_data_received: string;
  timestamp: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface WebSocketMessage {
  type: 'sensor_data' | 'alert' | 'pong';
  data?: any;
  timestamp: string;
}

class PondAPIClient {
  private token: string | null = null;

  constructor() {
    // Try to get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private getFetchOptions(method: string = 'GET', body?: any): RequestInit {
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send cookies
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return options;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Add more context for common errors
      if (response.status === 0) {
        errorMessage = 'Network error - check if backend is running on http://localhost:8000';
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed - check credentials or token expired';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden - insufficient permissions';
      } else if (response.status === 404) {
        errorMessage = 'Endpoint not found - check backend API routes';
      } else if (response.status >= 500) {
        errorMessage = `Server error (${response.status}) - check backend logs`;
      }
      
      throw new Error(errorMessage);
    }
    return response.json();
  }

  // Authentication
  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: formData,
      });

      const data = await this.handleResponse<AuthResponse>(response);
      
      // Store token
      this.token = data.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
      }

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await fetch(`${API_BASE}/mvp/dashboard/overview`, this.getFetchOptions());
      return this.handleResponse<DashboardOverview>(response);
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
      throw new Error(`Failed to fetch dashboard: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  // Pond Data
  async getLatestPondData(pondId: string): Promise<PondLatestData> {
    const response = await fetch(`${API_BASE}/mvp/pond/${pondId}/latest`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PondLatestData>(response);
  }

  async getPondHistory(pondId: string, hours: number = 24): Promise<PondHistory> {
    const response = await fetch(`${API_BASE}/mvp/pond/${pondId}/history?hours=${hours}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PondHistory>(response);
  }

  async getPondAlerts(
    pondId: string, 
    activeOnly: boolean = true, 
    limit: number = 50
  ): Promise<PondAlerts> {
    const params = new URLSearchParams({
      active_only: activeOnly.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE}/mvp/pond/${pondId}/alerts?${params}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<PondAlerts>(response);
  }

  // Chart Data
  async getPondChartData(
    pondId: string,
    hours: number = 24,
    parameters: string = "ph,temperature,dissolved_oxygen,water_level"
  ): Promise<PondChartData> {
    const params = new URLSearchParams({
      hours: hours.toString(),
      parameters: parameters,
    });

    const response = await fetch(`${API_BASE}/mvp/pond/${pondId}/chart-data?${params}`, this.getFetchOptions());
    return this.handleResponse<PondChartData>(response);
  }

  async getRealtimeChartData(
    pondId: string,
    parameter: string = "temperature",
    minutes: number = 60
  ): Promise<RealtimeChartData> {
    const params = new URLSearchParams({
      parameter: parameter,
      minutes: minutes.toString(),
    });

    const response = await fetch(`${API_BASE}/mvp/pond/${pondId}/realtime-chart?${params}`, this.getFetchOptions());
    return this.handleResponse<RealtimeChartData>(response);
  }

  // Alerts
  async getActiveAlerts(): Promise<ActiveAlerts> {
    const response = await fetch(`${API_BASE}/mvp/alerts/active`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<ActiveAlerts>(response);
  }

  async resolveAlert(alertId: string): Promise<{ message: string; alert_id: string }> {
    const response = await fetch(`${API_BASE}/mvp/alert/${alertId}/resolve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ message: string; alert_id: string }>(response);
  }

  // System
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await fetch(`${API_BASE}/mvp/system/status`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<SystemStatus>(response);
  }

  async getHealthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      return this.handleResponse<any>(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.getHealthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getServiceStatus(): Promise<any> {
    const response = await fetch(`${API_BASE}/mvp/services/status`);
    return this.handleResponse<any>(response);
  }

  // WebSocket connection
  createWebSocketConnection(): WebSocket {
    const wsUrl = API_BASE.replace('http', 'ws') + '/mvp/ws';
    return new WebSocket(wsUrl);
  }

  // Test SMS (admin only)
  async testSMS(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/mvp/test/sms`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ status: string; message: string }>(response);
  }
}

// Create singleton instance
export const apiClient = new PondAPIClient();

// Export for use in components
export default apiClient;
