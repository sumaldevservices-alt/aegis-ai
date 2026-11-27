/**
 * @aegis belongs to the default bot only while its source has no real
 * (pre-reservation) `aegis` profile. With one, the roster shows exactly one
 * @aegis — the real profile — and the default answers to @default, so a
 * typed @aegis reaches the same profile the backend's message_agent does.
 */

import { describe, expect, it, vi } from 'vitest'

import { botHandle, botMentionTag, claimDefaultHandles, mergeMultiSourceRoster, resolveRosterMentions } from './data'
import { previewKind } from './row-helpers'
import type { RosterRow } from './types'

vi.mock('@aegis/plugin-sdk', async () => {
  const { atom } = await import('nanostores')

  return { atom, host: {}, queryClient: undefined, useQuery: vi.fn(), useValue: vi.fn() }
})

vi.mock('./shared', () => ({ getPluginCtx: () => null, ID: 'aegis-bots' }))

function roster(names: string[]): RosterRow[] {
  const local = { profiles: names.map(name => ({ name })) }

  // What Electron's buildAgentRoster reports for a single local source: bare-name handles.
  const union = {
    agents: names.map(profile => ({
      connectionId: 'local',
      connectionKind: 'local' as const,
      connectionLabel: 'This device',
      handle: profile,
      profile,
      targetProfile: profile
    })),
    primaryConnectionId: 'local'
  }

  return mergeMultiSourceRoster(local, union, 'local').profiles as RosterRow[]
}

describe('the @aegis handle', () => {
  it.each([
    [['default', 'researcher'], 'default'],
    [['default', 'aegis', 'researcher'], 'aegis']
  ])('roster %j shows one @aegis and a typed @aegis reaches %s', (names, owner) => {
    const rows = roster(names)
    const handles = rows.map(row => botHandle(row.name, row))

    expect(handles.filter(handle => handle === 'aegis')).toHaveLength(1)
    expect(rows.map(row => botMentionTag(row)).filter(tag => tag === 'aegis')).toHaveLength(1)
    expect(resolveRosterMentions('@aegis ping', rows, { name: 'researcher' }).map(row => row.name)).toEqual([owner])
  })

  it('names the default @default once a real aegis profile holds the handle', () => {
    const rows = roster(['default', 'aegis', 'researcher'])
    const byName = Object.fromEntries(rows.map(row => [row.name, botHandle(row.name, row)]))

    expect(byName).toEqual({ default: 'default', aegis: 'aegis', researcher: 'researcher' })
    expect(resolveRosterMentions('@default ping', rows, { name: 'researcher' }).map(row => row.name)).toEqual(['default'])
  })

  it('keeps each source separate: a remote aegis profile does not rename the local default', () => {
    const rows = claimDefaultHandles<Partial<RosterRow>>([
      { connectionId: 'local', name: 'default' },
      { connectionId: 'mini', name: 'default' },
      { connectionId: 'mini', name: 'aegis' }
    ])

    expect(rows.map(row => botHandle(String(row.name), row))).toEqual(['aegis', 'default', 'aegis'])
  })

  it("never lets a source's stale 'aegis' handle on its default answer @aegis", () => {
    // An older backend labels its default @aegis even beside a real aegis profile.
    const rows = claimDefaultHandles<RosterRow>([
      { connectionId: 'mini', handle: 'aegis', name: 'default', remoteSource: true },
      { connectionId: 'mini', handle: 'aegis', name: 'aegis', remoteSource: true },
      { connectionId: 'local', name: 'researcher' }
    ])

    expect(resolveRosterMentions('@aegis ping', rows, { name: 'researcher' }).map(row => row.name)).toEqual(['aegis'])
  })

  it('names a DM sender in a row preview by its roster handle', () => {
    const rows = claimDefaultHandles<RosterRow>(
      ['default', 'aegis', 'researcher'].map(name => ({ connectionId: 'local', name }))
    )

    const sender = (name: string, list: RosterRow[]) =>
      previewKind(`Message from 🤖 ${name} (@x): hi`, list, 'local').fromBot

    expect([sender('default', rows), sender('aegis', rows)]).toEqual(['default', 'aegis'])
    // No real aegis profile: the default is still @aegis (#89484).
    expect(sender('default', claimDefaultHandles<RosterRow>([{ connectionId: 'local', name: 'default' }]))).toBe(
      'aegis'
    )
  })
})
