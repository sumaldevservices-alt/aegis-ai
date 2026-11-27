import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { test } from 'vitest'

import { createDesktopProfilePreferences } from './desktop-profile'
import { applyLaunchProfileOverride, parseLaunchProfile } from './launch-profile'

function withStoredProfile(profile: string, run: (target: string) => void) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-profile-'))
  const target = path.join(root, 'active-profile.json')
  const preferences = createDesktopProfilePreferences(target)

  try {
    preferences.remember(profile)
    preferences.setDefault({ connectionId: null, profile })
    run(target)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
}

test('parses both --profile spellings and ignores a missing flag', () => {
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile', 'desktop']), 'desktop')
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile=desktop']), 'desktop')
  assert.equal(parseLaunchProfile(['open', '-a', 'Aegis', '--args', '--profile', 'work']), 'work')
  assert.equal(parseLaunchProfile(['Aegis.exe', '--local']), null)
  assert.equal(parseLaunchProfile(['Aegis.exe']), null)
})

test('normalizes a launch profile the same way the CLI does', () => {
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile', '  Desktop  ']), 'desktop')
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile=Work']), 'work')
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile', 'default']), 'default')
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile']), null)
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile=']), null)
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile', 'my profile']), null)
  assert.equal(parseLaunchProfile(['Aegis.exe', '--profile', '-desktop']), null)
})

test('a launch --profile is persisted before the backend reads active-profile.json', () => {
  withStoredProfile('stored', target => {
    const preferences = createDesktopProfilePreferences(target)

    const launched = applyLaunchProfileOverride(['Aegis.exe', '--profile', 'desktop'], name => {
      preferences.remember(name)
    })

    const restarted = createDesktopProfilePreferences(target)

    assert.equal(launched, 'desktop')
    assert.equal(restarted.readActive(), 'desktop')
    assert.deepEqual(restarted.getDefault(), { connectionId: null, profile: 'stored' })
  })
})

test('--profile=<name> persists the same profile the space spelling does', () => {
  withStoredProfile('stored', target => {
    const preferences = createDesktopProfilePreferences(target)

    applyLaunchProfileOverride(['Aegis.exe', '--ozone-platform=wayland', '--profile=desktop'], name => {
      preferences.remember(name)
    })

    assert.equal(createDesktopProfilePreferences(target).readActive(), 'desktop')
  })
})

test('a missing or invalid flag does not change the stored profile', () => {
  for (const argv of [
    ['Aegis.exe'],
    ['Aegis.exe', '--local'],
    ['Aegis.exe', '--profile'],
    ['Aegis.exe', '--profile', 'Not a name'],
    ['Aegis.exe', '--profile=../desktop']
  ]) {
    withStoredProfile('stored', target => {
      const before = fs.readFileSync(target, 'utf8')
      let persisted = false

      const launched = applyLaunchProfileOverride(argv, () => {
        persisted = true
      })

      assert.equal(launched, null)
      assert.equal(persisted, false)
      assert.equal(fs.readFileSync(target, 'utf8'), before)
    })
  }
})
