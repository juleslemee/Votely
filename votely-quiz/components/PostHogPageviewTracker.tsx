"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { capturePosthogEvent } from "@/lib/posthog-client"

/**
 * Tracks client-side navigation changes and records PostHog pageviews.
 * We call PostHog directly instead of relying on autocapture so we get
 * consistent, SPA-friendly analytics with referrers intact.
 */
export function PostHogPageviewTracker() {
  const posthog = usePostHog()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !posthog) return

    const url = `${window.location.pathname}${window.location.search}`
    if (previousUrlRef.current === url) return

    const fullUrl = window.location.href
    const referrer = document.referrer || previousUrlRef.current
    let referringDomain: string | undefined

    if (referrer) {
      try {
        referringDomain = new URL(referrer).hostname
      } catch {
        referringDomain = undefined
      }
    }

    capturePosthogEvent(posthog, "$pageview", {
      $current_url: fullUrl,
      $pathname: window.location.pathname,
      $referrer: referrer || undefined,
      $referring_domain: referringDomain,
    })

    if (previousUrlRef.current !== null) {
      capturePosthogEvent(posthog, "route_changed", {
        current_url: fullUrl,
        pathname: window.location.pathname,
        search: window.location.search,
        referrer: referrer || undefined,
        referring_domain: referringDomain,
      })
    }

    previousUrlRef.current = url
  }, [pathname, searchParams, posthog])

  return null
}
