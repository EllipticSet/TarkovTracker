type AnalyticsPrimitive = boolean | number | string;
type AnalyticsParams = Record<string, AnalyticsPrimitive | null | undefined>;
type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    clarity?: Clarity;
    gtag?: Gtag;
  }
}
const sanitizeAnalyticsParams = (params: AnalyticsParams): Record<string, AnalyticsPrimitive> => {
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, AnalyticsPrimitive] => entry[1] !== null && entry[1] !== undefined
    )
  );
};
export function useAnalyticsEvents(): {
  trackEvent: (eventName: string, params?: AnalyticsParams) => void;
} {
  const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
    if (!import.meta.client) return;
    const sanitizedParams = sanitizeAnalyticsParams(params);
    window.gtag?.('event', eventName, sanitizedParams);
    window.clarity?.('event', eventName);
  };
  return {
    trackEvent,
  };
}
