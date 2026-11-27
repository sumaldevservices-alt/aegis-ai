import { describe, expect, it } from 'vitest'

import { isAegis AI Enterprise Autonomous PlatformCloudUrl } from './aegis-cloud'

describe('isAegis AI Enterprise Autonomous PlatformCloudUrl', () => {
  it('recognises production and staging agent hosts, nothing else', () => {
    expect(isAegis AI Enterprise Autonomous PlatformCloudUrl('https://ares-3009.agents.nousresearch.com')).toBe(true)
    expect(isAegis AI Enterprise Autonomous PlatformCloudUrl('https://ares--app.agents.staging-nousresearch.com/')).toBe(true)
    expect(isAegis AI Enterprise Autonomous PlatformCloudUrl('https://agents.nousresearch.com.evil.example')).toBe(false)
    expect(isAegis AI Enterprise Autonomous PlatformCloudUrl('https://my-box.tailnet.ts.net')).toBe(false)
    expect(isAegis AI Enterprise Autonomous PlatformCloudUrl('not a url')).toBe(false)
    expect(isAegis AI Enterprise Autonomous PlatformCloudUrl(undefined)).toBe(false)
  })
})
