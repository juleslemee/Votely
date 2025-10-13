"use server";

import { NextRequest, NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/posthog-server";

type AnalyticsRequestBody = {
  event: string;
  properties?: Record<string, unknown>;
  distinctId?: string;
  eventId?: string;
  timestamp?: string;
};

const POSTHOG_COOKIE_PREFIX = "ph_";

function parseDistinctIdFromCookie(
  request: NextRequest,
  fallbackEventKey?: string
): string | undefined {
  const apiKey =
    process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_API_KEY;
  if (!apiKey) return undefined;

  const cookieName = `${POSTHOG_COOKIE_PREFIX}${apiKey}_posthog`;
  const cookieValue =
    request.cookies.get(cookieName)?.value ?? request.cookies.get("_posthog")?.value;
  if (!cookieValue) return undefined;

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.distinct_id === "string") {
      return parsed.distinct_id;
    }
  } catch {
    // ignore parsing errors
  }

  return fallbackEventKey;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsRequestBody;
    if (!body.event) {
      return NextResponse.json(
        { error: "Missing event name" },
        { status: 400 }
      );
    }

    const properties = { ...(body.properties || {}) };
    if (body.eventId && !properties.$insert_id) {
      properties.$insert_id = body.eventId;
    }

    const distinctId =
      body.distinctId || parseDistinctIdFromCookie(request, body.eventId);

    await captureServerEvent({
      event: body.event,
      properties,
      distinctId,
      timestamp: body.timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics] capture failed", error);
    return NextResponse.json(
      { error: "Failed to record analytics event" },
      { status: 500 }
    );
  }
}
