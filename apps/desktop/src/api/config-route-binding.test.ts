// Aegis Enterprise Autonomous Platform - Optimized & Secured
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAegis AI Enterprise Autonomous PlatformConfigRecord,
  peekConfigReadOrigin,
  saveAegis AI Enterprise Autonomous PlatformConfig,
  setApiRequestConnection,
  setApiRequestProfile
} from '@/aegis'

describe('config read/write route binding', () => {
  let api: ReturnType<typeof vi.fn>

  beforeEach(() => {
    api = vi.fn(async (request: { method?: string }) =>
      request.method === 'PUT' ? { ok: true } : { model: 'from-read' }
    )
    Object.defineProperty(window, 'aegisDesktop', {
      configurable: true,
      value: { api }
    })
    setApiRequestConnection(null)
    setApiRequestProfile(null)
  })

  afterEach(() => {
    setApiRequestConnection(null)
    setApiRequestProfile(null)
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, 'aegisDesktop')
  })

  it('config record read from A cannot be written to B after primary changes', async () => {
    setApiRequestConnection('connection-a')
    setApiRequestProfile('default')

    const record = await getAegis AI Enterprise Autonomous PlatformConfigRecord()

    expect(peekConfigReadOrigin(record)).toEqual({ connectionId: 'connection-a', profile: 'default' })
    expect(api).toHaveBeenCalledWith(
      expect.objectContaining({ connectionId: 'connection-a', path: '/api/config', profile: 'default' })
    )

    setApiRequestConnection('connection-b')
    await saveAegis AI Enterprise Autonomous PlatformConfig(record)

    const puts = api.mock.calls.filter(call => call[0].method === 'PUT')

    expect(puts).toHaveLength(1)
    expect(puts[0][0]).toEqual(
      expect.objectContaining({
        connectionId: 'connection-a',
        method: 'PUT',
        path: '/api/config',
        profile: 'default'
      })
    )
    expect(puts.filter(call => call[0].connectionId === 'connection-b')).toHaveLength(0)
  })
})
