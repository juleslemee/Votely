"use client";

import type { PostHog } from "posthog-js";

type CaptureOptions = {
  sendToServer?: boolean;
  posthogOptions?: Record<string, unknown>;
};

const ANALYTICS_ENDPOINT = "/api/analytics";

function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function sendToServer(payload: {
  event: string;
  properties: Record<string, unknown>;
  distinctId?: string;
  eventId: string;
}) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    event: payload.event,
    properties: payload.properties,
    distinctId: payload.distinctId,
    eventId: payload.eventId,
  });

  try {
    if (navigator?.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    } else {
      await fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        keepalive: true,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] Server capture failed", error);
    }
  }
}

export function capturePosthogEvent(
  posthog: PostHog | undefined | null,
  event: string,
  properties: Record<string, unknown> = {},
  options: CaptureOptions = {}
) {
  if (!event) return;

  const eventId =
    (typeof properties.$insert_id === "string" && properties.$insert_id) ||
    generateEventId();

  const payload = {
    ...properties,
    $insert_id: eventId,
  };

  let distinctId: string | undefined;
  try {
    distinctId = posthog?.get_distinct_id?.();
    posthog?.capture(event, payload, options.posthogOptions);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] Browser capture failed", error);
    }
  }

  if (options.sendToServer) {
    void sendToServer({
      event,
      properties: payload,
      distinctId,
      eventId,
    });
  }

  return eventId;
}
