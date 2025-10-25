"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_API_HOST ||
  process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  "/ingest"

type PostHogWindow = typeof window & {
  posthog?: typeof posthog
  __posthogInitialized?: boolean
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const posthogWindow = window as PostHogWindow

    if (!POSTHOG_KEY) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY is missing; analytics will stay disabled.")
      }
      return
    }

    if (posthogWindow.__posthogInitialized) {
      posthogWindow.posthog = posthog
      return
    }

    posthogWindow.__posthogInitialized = true

    const apiHost = POSTHOG_HOST.startsWith("http")
      ? POSTHOG_HOST
      : POSTHOG_HOST.startsWith("/")
        ? `${window.location.origin}${POSTHOG_HOST}`
        : `https://${POSTHOG_HOST}`

    posthog.init(POSTHOG_KEY, {
      api_host: apiHost,
      ui_host: "https://us.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      autocapture: true,
      debug: process.env.NODE_ENV === "development",
      loaded: (client) => {
        posthogWindow.posthog = client
        if (process.env.NODE_ENV === "development") {
          console.log("[PostHog] Initialized successfully")
        }
      }
    })

    return () => {
      if (process.env.NODE_ENV === "development") {
        posthog.reset()
        delete posthogWindow.posthog
        delete posthogWindow.__posthogInitialized
      }
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
