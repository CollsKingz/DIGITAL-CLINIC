/**
 * Notification Service - Firebase Cloud Messaging (FCM) & Webhook Integrations
 */

export class NotificationService {
  /**
   * Request push notification permission from browser
   */
  static async requestFCMToken(): Promise<string | null> {
    if (!('Notification' in window)) {
      console.warn("This browser does not support desktop notification.");
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Return dummy/simulated FCM Registration Token
        const token = `fcm_token_demo_${Date.now().toString(36)}`;
        console.log("FCM Registration Token acquired:", token);
        return token;
      }
    } catch (err) {
      console.warn("FCM permission request failed:", err);
    }
    return null;
  }

  /**
   * Send Webhook notification trigger (e.g. to SMS gateway or health worker dispatch)
   */
  static async triggerWebhookAlert(endpoint: string, payload: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...payload
        })
      });
      return res.ok;
    } catch (err) {
      console.warn("Webhook alert dispatch failed (using fallback logger):", err);
      return false;
    }
  }

  /**
   * Display immediate in-app browser alert or toast
   */
  static showLocalBrowserAlert(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }
}
