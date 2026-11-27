import { describe, expect, it } from 'vitest'

import { commandLineIsAegisRuntime } from './aegis-process'

// HX003: process identity comes from a whole argv TOKEN, never an argv substring.
describe('commandLineIsAegisRuntime (HX003 token matching)', () => {
  it('matches a real Aegis gateway command line', () => {
    expect(commandLineIsAegisRuntime('aegis\0gateway\0run')).toBe(true)
    expect(commandLineIsAegisRuntime('aegis gateway run')).toBe(true)
    expect(commandLineIsAegisRuntime('aegis --profile work gateway run')).toBe(true)
  })

  it('matches a Aegis launched by an interpreter (basename of a path token)', () => {
    expect(commandLineIsAegisRuntime('/venv/bin/python\0/venv/bin/aegis\0gateway\0run')).toBe(true)
    expect(commandLineIsAegisRuntime('C:\\Aegis\\aegis.exe gateway run')).toBe(true)
  })

  // The bug this replaces: a bare `.includes('aegis')` matched any of these.
  it('does NOT match an unrelated process whose path merely contains "aegis"', () => {
    expect(commandLineIsAegisRuntime('vim /home/user/aegis-notes.txt')).toBe(false)
    expect(commandLineIsAegisRuntime('/opt/aegisbrew/bin/tool --run')).toBe(false)
    expect(commandLineIsAegisRuntime('node /srv/aegis-dashboard/server.js')).toBe(false)
    expect(commandLineIsAegisRuntime('cat ~/.aegis/config.yaml')).toBe(false)
  })

  // G2 (#150283): the real unmanaged-gateway launch is `python -m aegis_cli.main … gateway
  // run`, which the executable-basename-only matcher REJECTED — so findRunningGatewayProfiles
  // missed a live gateway at first launch / profile repair. Mirror the canonical Python matcher
  // (gateway.status.looks_like_gateway_command_line): recognize the module entry point, by argv
  // TOKENS not a substring, carrying the gateway subcommand.
  it('matches a module-launched gateway (python -m aegis_cli.main … gateway run)', () => {
    expect(commandLineIsAegisRuntime('python\0-m\0aegis_cli.main\0-p\0x\0gateway\0run')).toBe(true)
    expect(commandLineIsAegisRuntime('python -m aegis_cli.main -p x gateway run')).toBe(true)
    expect(commandLineIsAegisRuntime('/venv/bin/python /venv/lib/aegis_cli/main.py gateway run')).toBe(true)
    expect(commandLineIsAegisRuntime('python -m aegis_cli.main --profile work gateway run')).toBe(true)
  })

  it('does NOT match a module entry without the gateway subcommand, nor an unrelated aegis-tool path', () => {
    // A aegis_cli.main invocation that is not a gateway (e.g. `chat`) is not a running gateway.
    expect(commandLineIsAegisRuntime('python -m aegis_cli.main chat')).toBe(false)
    // HX003: no substring; an unrelated tool whose path contains "aegis" is never a runtime.
    expect(commandLineIsAegisRuntime('/opt/aegis-tool/foo gateway run')).toBe(false)
    // `-p gateway` is a profile value, not a subcommand.
    expect(commandLineIsAegisRuntime('python -m aegis_cli.main -p gateway chat')).toBe(false)
  })
})
