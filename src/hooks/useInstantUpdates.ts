import { useState, useEffect, useCallback, useRef } from 'react';
import { useAutoRefresh } from './useAutoRefresh';

interface UseInstantUpdatesOptions {
  refreshData: () => Promise<void>;
  autoRefreshInterval?: number;
  enableAutoRefresh?: boolean;
  onRefreshStart?: () => void;
  onRefreshEnd?: () => void;
  onError?: (error: Error) => void;
}

interface InstantUpdatesState {
  isUpdating: boolean;
  lastUpdated: Date;
  error: Error | null;
  refreshCount: number;
}

export const useInstantUpdates = (options: UseInstantUpdatesOptions) => {
  const {
    refreshData,
    autoRefreshInterval = 30000, // 30 seconds default
    enableAutoRefresh = true,
    onRefreshStart,
    onRefreshEnd,
    onError
  } = options;

  const [state, setState] = useState<InstantUpdatesState>({
    isUpdating: false,
    lastUpdated: new Date(),
    error: null,
    refreshCount: 0
  });

  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const mountedRef = useRef(true);

  // Force component re-render
  const forceUpdate = useCallback(() => {
    if (mountedRef.current) {
      setForceUpdateCounter(prev => prev + 1);
    }
  }, []);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (state.isUpdating) return; // Prevent concurrent refreshes

    setState(prev => ({ ...prev, isUpdating: true, error: null }));
    onRefreshStart?.();

    try {
      await refreshData();
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          lastUpdated: new Date(),
          refreshCount: prev.refreshCount + 1
        }));
        forceUpdate();
      }
    } catch (error) {
      const err = error as Error;
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isUpdating: false, error: err }));
      }
      onError?.(err);
    } finally {
      onRefreshEnd?.();
    }
  }, [refreshData, state.isUpdating, onRefreshStart, onRefreshEnd, onError, forceUpdate]);

  // Auto-refresh setup
  const { startAutoRefresh, stopAutoRefresh } = useAutoRefresh(
    manualRefresh,
    {
      interval: autoRefreshInterval,
      enabled: enableAutoRefresh && !state.isUpdating,
      onRefresh: () => console.log('Auto-refreshing data...'),
      onError: onError
    }
  );

  // Update last updated time when data changes externally
  const markDataUpdated = useCallback(() => {
    setState(prev => ({ ...prev, lastUpdated: new Date() }));
    forceUpdate();
  }, [forceUpdate]);

  // Set updating state for external operations
  const setUpdating = useCallback((updating: boolean) => {
    setState(prev => ({ ...prev, isUpdating: updating }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    // State
    isUpdating: state.isUpdating,
    lastUpdated: state.lastUpdated,
    error: state.error,
    refreshCount: state.refreshCount,
    forceUpdateCounter,

    // Actions
    manualRefresh,
    forceUpdate,
    markDataUpdated,
    setUpdating,
    clearError,
    startAutoRefresh,
    stopAutoRefresh
  };
};

export default useInstantUpdates;
