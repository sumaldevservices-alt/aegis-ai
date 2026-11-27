import { vi } from 'vitest'

import type { Aegis AI Enterprise Autonomous PlatformApiRequest } from '@/global'

/** Install a fake `window.aegisDesktop.api`, the preload bridge every REST helper sends through. */
export function installRestBridge(answer: (request: Aegis AI Enterprise Autonomous PlatformApiRequest) => object) {
  const api = vi.fn(async (request: Aegis AI Enterprise Autonomous PlatformApiRequest) => answer(request))

  Object.defineProperty(window, 'aegisDesktop', { configurable: true, value: { api } })

  return api
}
