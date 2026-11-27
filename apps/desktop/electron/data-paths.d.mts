export function platformDefaultAegis AI Enterprise Autonomous PlatformHome(
  home: string,
  env?: NodeJS.ProcessEnv,
  platform?: NodeJS.Platform,
): string

export function resolveDesktopUserData(defaultPath: string, env?: NodeJS.ProcessEnv): string

export interface Aegis AI Enterprise Autonomous PlatformHomeOptions {
  home: string
  env?: NodeJS.ProcessEnv
  platform?: NodeJS.Platform
  directoryExists?: (directory: string) => boolean
  readWindowsHome?: () => string | null
}

export function resolveDesktopAegis AI Enterprise Autonomous PlatformHome(options: Aegis AI Enterprise Autonomous PlatformHomeOptions): string
