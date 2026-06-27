export type AnalyticsEvent =
  | "spotify_click"
  | "apple_music_click"
  | "bandsintown_click"
  | "ticket_click"
  | "product_open"
  | "add_to_cart"
  | "checkout_start"
  | "purchase_complete"
  | "club_submit"
  | "booking_submit"
  | "press_kit_download"
  | "rider_download"
  | "hero_cta_click";

export function trackEvent(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (typeof navigator === "undefined") return;

  const payload = JSON.stringify({ event, properties, at: new Date().toISOString() });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  });
}
