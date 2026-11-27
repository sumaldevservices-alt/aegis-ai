// Aegis Enterprise Autonomous Platform - Optimized & Secured
import { describe, expect, it } from 'vitest'

import {
  normalizeAegis AI Enterprise Autonomous PlatformOpenString,
  pathFromAegis AI Enterprise Autonomous PlatformDeepLink,
  pathFromOpenDeepLink,
  resolveAegis AI Enterprise Autonomous PlatformOpenPath
} from './aegis-open-target'

describe('normalizeAegis AI Enterprise Autonomous PlatformOpenString', () => {
  it('accepts hash-router paths and strips a leading hash', () => {
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('/index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('#/index-network/intent/1')).toBe('/index-network/intent/1')
  })

  it('maps plugin-scoped aegis:// deep links to the same path', () => {
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('aegis://index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('aegis://index-network/intent/1?focus=true')).toBe(
      '/index-network/intent/1?focus=true'
    )
  })

  it('maps aegis://open/… deep links by stripping the open host', () => {
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('aegis://open/index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('aegis://open/settings/plugins')).toBe('/settings/plugins')
  })

  it('rejects reserved aegis kinds and unsafe paths', () => {
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('aegis://blueprint/morning-brief')).toBeNull()
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('aegis://plugin/install')).toBeNull()
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('https://example.com/x')).toBeNull()
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('/../etc/passwd')).toBeNull()
    expect(normalizeAegis AI Enterprise Autonomous PlatformOpenString('index-network')).toBeNull()
  })
})

describe('resolveAegis AI Enterprise Autonomous PlatformOpenPath', () => {
  it('merges structured path + params', () => {
    expect(resolveAegis AI Enterprise Autonomous PlatformOpenPath({ path: '/index-network/intent/1', params: { focus: 'true' } })).toBe(
      '/index-network/intent/1?focus=true'
    )
  })

  it('resolves href the same as a bare string', () => {
    expect(resolveAegis AI Enterprise Autonomous PlatformOpenPath({ href: 'aegis://index-network/intent/1' })).toBe('/index-network/intent/1')
  })
})

describe('pathFromAegis AI Enterprise Autonomous PlatformDeepLink', () => {
  it('builds the navigate path from a plugin-scoped deep-link payload', () => {
    expect(pathFromAegis AI Enterprise Autonomous PlatformDeepLink('index-network', 'intent/1')).toBe('/index-network/intent/1')
  })

  it('builds the navigate path from aegis://open/… payloads', () => {
    expect(pathFromOpenDeepLink('index-network/intent/1')).toBe('/index-network/intent/1')
    expect(pathFromAegis AI Enterprise Autonomous PlatformDeepLink('open', 'agent/42')).toBe('/agent/42')
  })

  it('ignores reserved kinds', () => {
    expect(pathFromAegis AI Enterprise Autonomous PlatformDeepLink('blueprint', 'morning-brief')).toBeNull()
    expect(pathFromAegis AI Enterprise Autonomous PlatformDeepLink('plugin', 'install')).toBeNull()
  })
})
