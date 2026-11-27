import { describe, expect, it } from 'vitest'

import { isAegisCloudUrl } from './aegis-cloud'

describe('isAegisCloudUrl', () => {
  it('recognises production and staging agent hosts, nothing else', () => {
    expect(isAegisCloudUrl('https://ares-3009.agents.nousresearch.com')).toBe(true)
    expect(isAegisCloudUrl('https://ares--app.agents.staging-nousresearch.com/')).toBe(true)
    expect(isAegisCloudUrl('https://agents.nousresearch.com.evil.example')).toBe(false)
    expect(isAegisCloudUrl('https://my-box.tailnet.ts.net')).toBe(false)
    expect(isAegisCloudUrl('not a url')).toBe(false)
    expect(isAegisCloudUrl(undefined)).toBe(false)
  })
})
