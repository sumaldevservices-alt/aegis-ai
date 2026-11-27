import assert from 'node:assert/strict'

import { test } from 'vitest'

import { hasWindowsPathPrefix, isExternalVenvHolder, isAegisOwnedVenvDaemon } from './venv-holder-select'

const SCRIPTS = 'C:\\Aegis\\venv\\Scripts'

test('matches the hindsight daemon shim (exe under venv Scripts + hindsight cmdline)', () => {
  assert.equal(
    isAegisOwnedVenvDaemon(
      'C:\\Aegis\\venv\\Scripts\\pythonw.exe',
      'C:\\Aegis\\venv\\Scripts\\pythonw.exe -m hindsight_api.main --daemon --idle-timeout 300 --port 9177',
      SCRIPTS
    ),
    true
  )
})

test('Windows path prefix match is ordinal case-insensitive', () => {
  assert.equal(
    isAegisOwnedVenvDaemon(
      'c:\\aegis\\venv\\scripts\\python.exe',
      'python.exe -m hindsight_api.main --daemon',
      'C:\\Aegis\\venv\\Scripts'
    ),
    true
  )
})

test('excludes external venv holders that are not the hindsight daemon', () => {
  // a user terminal running the aegis CLI from the venv — must NOT be killed
  assert.equal(isAegisOwnedVenvDaemon('C:\\Aegis\\venv\\Scripts\\aegis.exe', 'aegis chat -q "hi"', SCRIPTS), false)
  // an unrelated python script using the venv interpreter
  assert.equal(
    isAegisOwnedVenvDaemon('C:\\Aegis\\venv\\Scripts\\python.exe', 'python C:\\tools\\import.py', SCRIPTS),
    false
  )
})

test('excludes exes outside the venv even when the cmdline mentions hindsight', () => {
  assert.equal(
    isAegisOwnedVenvDaemon('C:\\Other\\pythonw.exe', 'pythonw -m hindsight_api.main --daemon', SCRIPTS),
    false
  )
})

test('prefix boundary: sibling dirs (ScriptsX) do not match', () => {
  assert.equal(hasWindowsPathPrefix('C:\\Aegis\\venv\\ScriptsX\\python.exe', SCRIPTS), false)
  assert.equal(hasWindowsPathPrefix('C:\\Aegis\\venv\\Scripts\\python.exe', SCRIPTS), true)
})

test('null/undefined fields never match', () => {
  assert.equal(isAegisOwnedVenvDaemon(null, 'x', SCRIPTS), false)
  assert.equal(isAegisOwnedVenvDaemon('C:\\Aegis\\venv\\Scripts\\pythonw.exe', null, SCRIPTS), false)
  assert.equal(isAegisOwnedVenvDaemon(undefined, undefined, SCRIPTS), false)
})

// --- isExternalVenvHolder (#62311) ------------------------------------------

test('matches the autostart gateway shim (aegis.exe under venv Scripts)', () => {
  assert.equal(
    isExternalVenvHolder(
      'C:\\Aegis\\venv\\Scripts\\aegis.exe',
      '"C:\\Aegis\\venv\\Scripts\\aegis.exe" gateway run --external-supervisor',
      SCRIPTS
    ),
    true
  )
})

test('matches the dashboard scheduled task (python -m aegis_cli / -m aegis)', () => {
  assert.equal(
    isExternalVenvHolder(
      'C:\\Aegis\\venv\\Scripts\\python.exe',
      '"C:\\Aegis\\venv\\Scripts\\python.exe" -m aegis_cli.main dashboard',
      SCRIPTS
    ),
    true
  )
  assert.equal(
    isExternalVenvHolder('C:\\Aegis\\venv\\Scripts\\pythonw.exe', 'pythonw.exe -m aegis serve', SCRIPTS),
    true
  )
})

test('never matches an unrelated process that merely borrows the venv interpreter', () => {
  // a user's own script running on the venv python — NOT Aegis, must NOT be killed
  assert.equal(
    isExternalVenvHolder('C:\\Aegis\\venv\\Scripts\\python.exe', 'python C:\\tools\\import.py', SCRIPTS),
    false
  )
  // hindsight daemon is selected by isAegisOwnedVenvDaemon, not here
  assert.equal(
    isExternalVenvHolder('C:\\Aegis\\venv\\Scripts\\pythonw.exe', 'pythonw -m hindsight_api.main --daemon', SCRIPTS),
    false
  )
})

test('never matches a process outside the venv, even with aegis in the cmdline', () => {
  // an editor / shell whose command line mentions the install root (#62445 regression guard)
  assert.equal(
    isExternalVenvHolder('C:\\Windows\\System32\\cmd.exe', 'cmd /c cd C:\\Aegis\\venv\\Scripts && dir', SCRIPTS),
    false
  )
  assert.equal(isExternalVenvHolder('C:\\Other\\aegis.exe', 'aegis gateway run', SCRIPTS), false)
})

test('sibling-dir and boundary safety for the external selector', () => {
  assert.equal(isExternalVenvHolder('C:\\Aegis\\venv\\ScriptsX\\aegis.exe', 'aegis gateway run', SCRIPTS), false)
  assert.equal(isExternalVenvHolder(null, 'aegis gateway run', SCRIPTS), false)
  assert.equal(isExternalVenvHolder('C:\\Aegis\\venv\\Scripts\\aegis.exe', null, SCRIPTS), false)
})
