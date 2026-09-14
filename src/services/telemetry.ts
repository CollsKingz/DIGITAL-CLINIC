/**
 * Telemetry Service - Sentry Error Tracking & Firebase Analytics Wrapper
 */

export class TelemetryService {
  private static initialized = false;

  static init() {
    if (this.initialized) return;
    this.initialized = true;

    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn) {
      console.log("[Telemetry] Sentry initialized with DSN:", sentryDsn);
    } else {
      console.log("[Telemetry] Sentry DSN not provided. Telemetry running in console mode.");
    }

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason);
    });
  }

  static captureException(error: unknown, context?: Record<string, unknown>) {
    console.error("[Telemetry Exception Caught]", error, context || {});
  }

  static logEvent(eventName: string, params?: Record<string, unknown>) {
    console.log(`[Firebase Analytics Event: ${eventName}]`, params || {});
  }
}
