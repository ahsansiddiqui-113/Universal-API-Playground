export function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.gtag?.('event', event, properties);
  window.posthog?.capture(event, properties);
}

export function trackPageView(path: string) {
  trackEvent('page_view', { path });
}
