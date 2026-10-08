// Sentry is loaded after the page has rendered so it doesn't delay first paint.
let sentryPromise;

function loadSentry() {
  if (!sentryPromise) {
    sentryPromise = import('@sentry/react').then((Sentry) => {
      // Session replay is left out on purpose: it is large and would record
      // customer sessions, which the privacy policy does not cover.
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.1,
      });
      return Sentry;
    });
  }
  return sentryPromise;
}

export function initMonitoring() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  const start = () => loadSentry();
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 3000 });
  else setTimeout(start, 1000);
}

export function captureError(error, extra) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  loadSentry().then((Sentry) => Sentry.captureException(error, { extra }));
}
