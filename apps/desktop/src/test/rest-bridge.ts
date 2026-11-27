import { vi } from 'vitest'

import type { AegisApiRequest } from '@/global'

/** Install a fake `window.aegisDesktop.api`, the preload bridge every REST helper sends through. */
export function installRestBridge(answer: (request: AegisApiRequest) => object) {
  const api = vi.fn(async (request: AegisApiRequest) => answer(request))

  Object.defineProperty(window, 'aegisDesktop', { configurable: true, value: { api } })

  return api
}
