import { useState, useEffect, useCallback } from 'react';
import { 
  precacheCoastalTravelData, 
  getCoastalCacheState,
  getCachedServiceRequests,
  CoastalCacheSummary,
  hasFirestorePersistence,
  disableFirestoreNetwork,
  enableFirestoreNetwork,
} from '../lib/firestoreSync';
import { useAppStore } from '../stores/useAppStore';

export function useCoastalPersistence() {
  const { workOrders, quotes, providers, cities } = useAppStore();
  
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rsc_simulated_coastal_offline') === 'true';
    } catch {
      return false;
    }
  });
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [lastPrecachedAt, setLastPrecachedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem('rsc_last_coastal_precache');
    } catch {
      return null;
    }
  });
  const [precacheResult, setPrecacheResult] = useState<{ count: number; message: string } | null>(null);

  // Monitor browser network connectivity events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatedOffline) {
        enableFirestoreNetwork().catch(console.warn);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  // Pre-cache all Red Sea service requests and data for coastal travel
  const precacheForTravel = useCallback(async () => {
    setIsPrecaching(true);
    setPrecacheResult(null);
    try {
      const result = await precacheCoastalTravelData();
      setLastPrecachedAt(result.timestamp);
      setPrecacheResult({ count: result.count, message: result.message });
      return result;
    } finally {
      setIsPrecaching(false);
    }
  }, []);

  // Toggle simulated coastal offline transit mode (turns Firestore network off/on)
  const toggleSimulateOffline = useCallback(async () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    try {
      localStorage.setItem('rsc_simulated_coastal_offline', String(nextState));
    } catch {}

    if (nextState) {
      await disableFirestoreNetwork();
    } else {
      await enableFirestoreNetwork();
    }
  }, [isSimulatedOffline]);

  // Force reconnect to cloud
  const reconnectCloud = useCallback(async () => {
    setIsSimulatedOffline(false);
    try {
      localStorage.setItem('rsc_simulated_coastal_offline', 'false');
    } catch {}
    await enableFirestoreNetwork();
  }, []);

  const effectiveOffline = !isOnline || isSimulatedOffline;

  return {
    isOnline,
    isSimulatedOffline,
    effectiveOffline,
    hasPersistence: hasFirestorePersistence,
    cachedOrdersCount: workOrders.length,
    cachedQuotesCount: quotes.length,
    cachedProvidersCount: providers.length,
    cachedCitiesCount: cities.length,
    lastPrecachedAt,
    isPrecaching,
    precacheResult,
    precacheForTravel,
    toggleSimulateOffline,
    reconnectCloud,
    getCachedOrders: getCachedServiceRequests,
  };
}
