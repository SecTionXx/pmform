import { useState, useEffect } from 'react';

export interface UseOfflineReturn {
  /**
   * Whether the browser is currently offline
   */
  isOffline: boolean;

  /**
   * Whether the browser is currently online
   */
  isOnline: boolean;

  /**
   * Timestamp of last online status
   */
  lastOnline: Date | null;

  /**
   * Timestamp of last offline status
   */
  lastOffline: Date | null;

  /**
   * Whether the network status has been determined
   */
  isChecking: boolean;
}

/**
 * Hook for detecting online/offline network status
 *
 * @returns Network status information
 *
 * @example
 * ```tsx
 * const { isOffline, isOnline } = useOffline();
 *
 * if (isOffline) {
 *   return <div>You are offline. Changes will be saved locally.</div>;
 * }
 * ```
 */
export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [lastOffline, setLastOffline] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check initial status
    const initialStatus = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(initialStatus);

    if (initialStatus) {
      setLastOnline(new Date());
    } else {
      setLastOffline(new Date());
    }

    setIsChecking(false);

    // Handler for going online
    const handleOnline = () => {
      console.log('Network: Online');
      setIsOnline(true);
      setLastOnline(new Date());
    };

    // Handler for going offline
    const handleOffline = () => {
      console.log('Network: Offline');
      setIsOnline(false);
      setLastOffline(new Date());
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOffline: !isOnline,
    isOnline,
    lastOnline,
    lastOffline,
    isChecking,
  };
}

/**
 * Advanced hook with connectivity polling
 * Periodically checks network connectivity by pinging a URL
 *
 * @param pollInterval - Interval in milliseconds to check connectivity (default: 30000ms / 30 seconds)
 * @param pingUrl - URL to ping for connectivity check (default: /api/ping)
 * @returns Network status information
 */
export function useOfflineWithPolling(
  pollInterval: number = 30000,
  pingUrl: string = '/api/health'
): UseOfflineReturn {
  const baseStatus = useOffline();
  const [isOnline, setIsOnline] = useState(baseStatus.isOnline);
  const [lastOnline, setLastOnline] = useState<Date | null>(baseStatus.lastOnline);
  const [lastOffline, setLastOffline] = useState<Date | null>(baseStatus.lastOffline);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(pingUrl, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache',
        });

        clearTimeout(timeoutId);

        if (response.ok && !isOnline) {
          console.log('Network: Connectivity restored (polling)');
          setIsOnline(true);
          setLastOnline(new Date());
        }
      } catch (error) {
        if (isOnline) {
          console.log('Network: Connectivity lost (polling)');
          setIsOnline(false);
          setLastOffline(new Date());
        }
      }
    };

    // Start polling
    intervalId = setInterval(checkConnectivity, pollInterval);

    // Initial check
    checkConnectivity();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollInterval, pingUrl, isOnline]);

  // Sync with base status changes
  useEffect(() => {
    if (baseStatus.isOnline !== isOnline) {
      setIsOnline(baseStatus.isOnline);
      if (baseStatus.isOnline) {
        setLastOnline(new Date());
      } else {
        setLastOffline(new Date());
      }
    }
  }, [baseStatus.isOnline]);

  return {
    isOffline: !isOnline,
    isOnline,
    lastOnline,
    lastOffline,
    isChecking: baseStatus.isChecking,
  };
}
