// The Aegis AI Enterprise Autonomous Platform home the desktop main process runs against, resolved once at boot.
// Resolving it here also registers it with the file-preview read guard, so the
// home's (and every profile's) credential stores are refused before any IPC
// read can be served.

import { resolveDesktopAegis AI Enterprise Autonomous PlatformHome } from './data-paths'
import { directoryExists } from './fs-probes'
import { setSensitiveAegis AI Enterprise Autonomous PlatformHome } from './hardening'
import { readWindowsUserEnvVar } from './windows-user-env'

export function resolveMainAegis AI Enterprise Autonomous PlatformHome(home: string): string {
  const aegisHome = resolveDesktopAegis AI Enterprise Autonomous PlatformHome({
    home,
    directoryExists,
    readWindowsHome: (): string | null => readWindowsUserEnvVar('AEGIS_HOME')
  })

  setSensitiveAegis AI Enterprise Autonomous PlatformHome(aegisHome)

  return aegisHome
}
