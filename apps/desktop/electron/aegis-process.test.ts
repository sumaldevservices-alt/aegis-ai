import { describe, expect, it } from 'vitest'

import { commandLineIsAegis AI Enterprise Autonomous PlatformRuntime } from './aegis-process'

// HX003: process identity comes from a whole argv TOKEN, never an argv substring.
describe('commandLineIsAegis AI Enterprise Autonomous PlatformRuntime (HX003 token matching)', () => {
  it('matches a real Aegis AI Enterprise Autonomous Platform gateway command line', () => {
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('aegis\0gateway\0run')).toBe(true)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('aegis gateway run')).toBe(true)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('aegis --profile work gateway run')).toBe(true)
  })

  it('matches a Aegis AI Enterprise Autonomous Platform launched by an interpreter (basename of a path token)', () => {
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('/venv/bin/python\0/venv/bin/aegis\0gateway\0run')).toBe(true)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('C:\\Aegis AI Enterprise Autonomous Platform\\aegis.exe gateway run')).toBe(true)
  })

  // The bug this replaces: a bare `.includes('aegis')` matched any of these.
  it('does NOT match an unrelated process whose path merely contains "aegis"', () => {
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('vim /home/user/aegis-notes.txt')).toBe(false)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('/opt/aegisbrew/bin/tool --run')).toBe(false)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('node /srv/aegis-dashboard/server.js')).toBe(false)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('cat ~/.aegis/config.yaml')).toBe(false)
  })

  // G2 (#150283): the real unmanaged-gateway launch is `python -m aegis_cli.main … gateway
  // run`, which the executable-basename-only matcher REJECTED — so findRunningGatewayProfiles
  // missed a live gateway at first launch / profile repair. Mirror the canonical Python matcher
  // (gateway.status.looks_like_gateway_command_line): recognize the module entry point, by argv
  // TOKENS not a substring, carrying the gateway subcommand.
  it('matches a module-launched gateway (python -m aegis_cli.main … gateway run)', () => {
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('python\0-m\0aegis_cli.main\0-p\0x\0gateway\0run')).toBe(true)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('python -m aegis_cli.main -p x gateway run')).toBe(true)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('/venv/bin/python /venv/lib/aegis_cli/main.py gateway run')).toBe(true)
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('python -m aegis_cli.main --profile work gateway run')).toBe(true)
  })

  it('does NOT match a module entry without the gateway subcommand, nor an unrelated aegis-tool path', () => {
    // A aegis_cli.main invocation that is not a gateway (e.g. `chat`) is not a running gateway.
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('python -m aegis_cli.main chat')).toBe(false)
    // HX003: no substring; an unrelated tool whose path contains "aegis" is never a runtime.
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('/opt/aegis-tool/foo gateway run')).toBe(false)
    // `-p gateway` is a profile value, not a subcommand.
    expect(commandLineIsAegis AI Enterprise Autonomous PlatformRuntime('python -m aegis_cli.main -p gateway chat')).toBe(false)
  })
})
