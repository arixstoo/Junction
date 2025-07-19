/**
 * 📊 Dashboard Data Hook
 * Manages dashboard data fetching and state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type DashboardOverview, type ActiveAlerts, type SystemStatus } from '@/lib/api-client';

export function useDashboard(refreshInterval: number = 30000) {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlerts | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [overviewData, alertsData, statusData] = await Promise.all([
        apiClient.getDashboardOverview(),
        apiClient.getActiveAlerts(),
        apiClient.getSystemStatus(),
      ]);

      setOverview(overviewData);
      setActiveAlerts(alertsData);
      setSystemStatus(statusData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    overview,
    activeAlerts,
    systemStatus,
    loading,
    error,
    refresh,
  };
}

export function usePondData(pondId: string, refreshInterval: number = 60000) {
  const [latestData, setLatestData] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPondData = useCallback(async () => {
    if (!pondId) return;

    try {
      setError(null);
      const [latest, hist, alertData] = await Promise.all([
        apiClient.getLatestPondData(pondId),
        apiClient.getPondHistory(pondId, 24),
        apiClient.getPondAlerts(pondId, true, 20),
      ]);

      setLatestData(latest);
      setHistory(hist);
      setAlerts(alertData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pond data';
      setError(errorMessage);
      console.error('Pond fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pondId]);

  useEffect(() => {
    fetchPondData();
  }, [fetchPondData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPondData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPondData, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchPondData();
  }, [fetchPondData]);

  return {
    latestData,
    history,
    alerts,
    loading,
    error,
    refresh,
  };
}

export function useAlerts(refreshInterval: number = 30000) {
  const [alerts, setAlerts] = useState<ActiveAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const alertData = await apiClient.getActiveAlerts();
      setAlerts(alertData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch alerts';
      setError(errorMessage);
      console.error('Alerts fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await apiClient.resolveAlert(alertId);
      // Refresh alerts after resolving
      await fetchAlerts();
      return true;
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      return false;
    }
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAlerts, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refresh,
    resolveAlert,
  };
}
