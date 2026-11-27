// The Aegis home the desktop main process runs against, resolved once at boot.
// Resolving it here also registers it with the file-preview read guard, so the
// home's (and every profile's) credential stores are refused before any IPC
// read can be served.

import { resolveDesktopAegisHome } from './data-paths'
import { directoryExists } from './fs-probes'
import { setSensitiveAegisHome } from './hardening'
import { readWindowsUserEnvVar } from './windows-user-env'

export function resolveMainAegisHome(home: string): string {
  const aegisHome = resolveDesktopAegisHome({
    home,
    directoryExists,
    readWindowsHome: (): string | null => readWindowsUserEnvVar('AEGIS_HOME')
  })

  setSensitiveAegisHome(aegisHome)

  return aegisHome
}
