import { describe, expect, it } from 'vitest'

import {
  normalizeAegisOpenString,
  pathFromAegisDeepLink,
  pathFromOpenDeepLink,
  resolveAegisOpenPath
} from './aegis-open-target'

describe('normalizeAegisOpenString', () => {
  it('accepts hash-router paths and strips a leading hash', () => {
    expect(normalizeAegisOpenString('/index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizeAegisOpenString('#/index-network/intent/1')).toBe('/index-network/intent/1')
  })

  it('maps plugin-scoped aegis:// deep links to the same path', () => {
    expect(normalizeAegisOpenString('aegis://index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizeAegisOpenString('aegis://index-network/intent/1?focus=true')).toBe(
      '/index-network/intent/1?focus=true'
    )
  })

  it('maps aegis://open/… deep links by stripping the open host', () => {
    expect(normalizeAegisOpenString('aegis://open/index-network/intent/1')).toBe('/index-network/intent/1')
    expect(normalizeAegisOpenString('aegis://open/settings/plugins')).toBe('/settings/plugins')
  })

  it('rejects reserved aegis kinds and unsafe paths', () => {
    expect(normalizeAegisOpenString('aegis://blueprint/morning-brief')).toBeNull()
    expect(normalizeAegisOpenString('aegis://plugin/install')).toBeNull()
    expect(normalizeAegisOpenString('https://example.com/x')).toBeNull()
    expect(normalizeAegisOpenString('/../etc/passwd')).toBeNull()
    expect(normalizeAegisOpenString('index-network')).toBeNull()
  })
})

describe('resolveAegisOpenPath', () => {
  it('merges structured path + params', () => {
    expect(resolveAegisOpenPath({ path: '/index-network/intent/1', params: { focus: 'true' } })).toBe(
      '/index-network/intent/1?focus=true'
    )
  })

  it('resolves href the same as a bare string', () => {
    expect(resolveAegisOpenPath({ href: 'aegis://index-network/intent/1' })).toBe('/index-network/intent/1')
  })
})

describe('pathFromAegisDeepLink', () => {
  it('builds the navigate path from a plugin-scoped deep-link payload', () => {
    expect(pathFromAegisDeepLink('index-network', 'intent/1')).toBe('/index-network/intent/1')
  })

  it('builds the navigate path from aegis://open/… payloads', () => {
    expect(pathFromOpenDeepLink('index-network/intent/1')).toBe('/index-network/intent/1')
    expect(pathFromAegisDeepLink('open', 'agent/42')).toBe('/agent/42')
  })

  it('ignores reserved kinds', () => {
    expect(pathFromAegisDeepLink('blueprint', 'morning-brief')).toBeNull()
    expect(pathFromAegisDeepLink('plugin', 'install')).toBeNull()
  })
})
