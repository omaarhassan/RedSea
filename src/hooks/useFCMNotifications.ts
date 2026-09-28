import { useState, useEffect, useCallback } from 'react';
import { 
  initializeFCM, 
  requestFCMPermission, 
  getPushPreferences, 
  savePushPreferences, 
  sendTestPushNotification,
  PushPreferences, 
  PushNotificationPayload 
} from '../lib/fcmNotifications';
import { WorkOrder, WorkOrderStatus } from '../types';

export function useFCMNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<PushPreferences>(getPushPreferences());
  const [recentPushes, setRecentPushes] = useState<PushNotificationPayload[]>([]);
  const [latestPush, setLatestPush] = useState<PushNotificationPayload | null>(null);

  // Initialize on mount
  useEffect(() => {
    initializeFCM().then((res) => {
      setIsSupported(res.isSupported);
      setPermission(res.permission);
      setDeviceToken(res.token);
    });

    // Listen to in-app foreground FCM push events
    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PushNotificationPayload>;
      if (customEvent.detail) {
        setLatestPush(customEvent.detail);
        setRecentPushes((prev) => [customEvent.detail, ...prev.slice(0, 19)]);
      }
    };

    window.addEventListener('rsc_fcm_push', handlePushEvent);
    return () => {
      window.removeEventListener('rsc_fcm_push', handlePushEvent);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await requestFCMPermission();
      setPermission(res.permission);
      if (res.success && res.token) {
        setDeviceToken(res.token);
        const updated = savePushPreferences({ enabled: true });
        setPreferences(updated);
        return { success: true, token: res.token };
      }
      return { success: false, error: res.error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<PushPreferences>) => {
    const updated = savePushPreferences(newPrefs);
    setPreferences(updated);
  }, []);

  const triggerTestPush = useCallback(async (order?: WorkOrder, status: WorkOrderStatus = 'EN_ROUTE') => {
    setIsLoading(true);
    try {
      const payload = await sendTestPushNotification(order, status);
      return payload;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissLatestPush = useCallback(() => {
    setLatestPush(null);
  }, []);

  return {
    isSupported,
    permission,
    isPermissionGranted: permission === 'granted',
    deviceToken,
    isLoading,
    preferences,
    updatePreferences,
    requestPermission,
    triggerTestPush,
    recentPushes,
    latestPush,
    dismissLatestPush,
  };
}
