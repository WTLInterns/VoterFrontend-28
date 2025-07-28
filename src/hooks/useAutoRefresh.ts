import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval: number; // in milliseconds
  enabled?: boolean;
  onRefresh?: () => void;
  onError?: (error: Error) => void;
}

export const useAutoRefresh = (
  refreshFunction: () => Promise<void>,
  options: UseAutoRefreshOptions
) => {
  const {
    interval,
    enabled = true,
    onRefresh,
    onError
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const executeRefresh = useCallback(async () => {
    if (isRefreshingRef.current) {
      return; // Prevent concurrent refreshes
    }

    try {
      isRefreshingRef.current = true;
      onRefresh?.();
      await refreshFunction();
    } catch (error) {
      console.error('Auto-refresh error:', error);
      onError?.(error as Error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshFunction, onRefresh, onError]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start the interval
    intervalRef.current = setInterval(executeRefresh, interval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, executeRefresh]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    await executeRefresh();
  }, [executeRefresh]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(executeRefresh, interval);
    }
  }, [enabled, interval, executeRefresh]);

  return {
    manualRefresh,
    stopAutoRefresh,
    startAutoRefresh,
    isRefreshing: isRefreshingRef.current
  };
};

export default useAutoRefresh;
