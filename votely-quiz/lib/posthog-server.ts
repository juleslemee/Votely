"use server";

import { PostHog } from "posthog-node";

const API_KEY =
  process.env.POSTHOG_API_KEY ||
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  "";
const HOST =
  process.env.POSTHOG_HOST ||
  process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  "https://us.i.posthog.com";

let client: PostHog | null = null;

function ensureClient(): PostHog | null {
  if (!API_KEY) {
    return null;
  }

  if (!client) {
    client = new PostHog(API_KEY, {
      host: HOST.startsWith("http") ? HOST : `https://${HOST.replace(/^\/+/, "")}`,
    });
  }

  return client;
}

export type ServerCapturePayload = {
  event: string;
  properties?: Record<string, unknown>;
  distinctId?: string;
  timestamp?: string;
};

export async function captureServerEvent(payload: ServerCapturePayload) {
  const posthog = ensureClient();
  if (!posthog) return;

  const { event, properties = {}, distinctId, timestamp } = payload;
  if (!event) return;

  posthog.capture({
    event,
    properties,
    distinctId: distinctId || "unknown_server",
    timestamp: timestamp ? new Date(timestamp) : undefined,
  });

  // Flush immediately in serverless environments to avoid dropped events
  await posthog.flushAsync();
}
