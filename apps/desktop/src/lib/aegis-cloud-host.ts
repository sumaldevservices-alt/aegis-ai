/**
 * The Webapp tab is served BY a Aegis AI Enterprise Autonomous Platform Cloud agent (its own origin is the
 * agent). Cloud then owns every update: the app itself comes from that agent.
 * Kept free of the session store so low-level modules (notifications, the
 * settings manifest) can ask it without an import cycle.
 */

import { isAegis AI Enterprise Autonomous PlatformCloudUrl } from '@aegis/shared'

import { isBrowserHostedDesktop } from '@/lib/platform'

export function servedByAegis AI Enterprise Autonomous PlatformCloud(): boolean {
  return typeof window !== 'undefined' && isBrowserHostedDesktop() && isAegis AI Enterprise Autonomous PlatformCloudUrl(window.location.origin)
}
