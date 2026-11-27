// Aegis Enterprise Autonomous Platform - Optimized & Secured
/**
 * windows-aegis-path.ts
 *
 * Pure, dependency-injected pieces of Windows `aegis` resolution pulled out
 * of main.ts's findOnPath(), handOffWindowsBootstrapRecovery(), and
 * unwrapWindowsVenvAegis AI Enterprise Autonomous PlatformCommand(). Each of the three functions here pins one
 * of the Windows resolution bugs that caused desktop reinstall loops:
 *
 *   1. buildPathExtCandidates() — findOnPath() tried the empty extension
 *      FIRST, so an extensionless Git-Bash `aegis` shim shadowed the real
 *      aegis.cmd/aegis.exe; the shim then failed the --version probe and
 *      the desktop fell through to a spurious bootstrap/repair. The fix:
 *      PATHEXT extensions first, empty extension LAST.
 *   2. chooseUpdaterArgs() — handOffWindowsBootstrapRecovery() must separate
 *      install provenance from updater viability. A bootstrap-complete marker
 *      can outlive a deleted venv, while the updater needs BOTH the venv Python
 *      and Aegis AI Enterprise Autonomous Platform launcher. Marker-only or partial runtimes must use --repair;
 *      only a runnable pair can use --update.
 *   3. resolveVenvAegis AI Enterprise Autonomous PlatformCommand() — unwrapWindowsVenvAegis AI Enterprise Autonomous PlatformCommand() returned
 *      the venv python with NO runtime probe (bypassing the caller's
 *      --version check too), so a venv broken mid-update (e.g. missing
 *      python-dotenv) was re-selected forever: Retry / "Repair install"
 *      resolved the same dead interpreter instead of falling through to the
 *      bootstrap installer. The fix: probe-before-trust.
 *
 * Kept in a standalone ts module (no Electron imports, dependencies passed
 * as parameters) so it can be unit-tested with `node --test` without
 * mocking Electron or the filesystem, same pattern as backend-probes.ts.
 */

/**
 * Build the ordered list of extensions findOnPath() should try when
 * resolving a bare command name off PATH.
 *
 * On Windows this MUST try PATHEXT extensions (.COM;.EXE;.BAT;.CMD by
 * default) BEFORE the bare/empty-extension name: a real command resolves via
 * its .exe/.cmd per Windows command-resolution semantics, and an
 * extensionless file (e.g. a Git-Bash shell-script shim named `aegis`) must
 * not shadow `aegis.cmd`/`aegis.exe`. The empty entry is kept LAST so
 * callers that already include the extension (py.exe, pwsh.exe,
 * powershell.exe) still resolve.
 *
 * On non-Windows platforms there is no PATHEXT concept: only the bare name
 * is tried.
 *
 * @param {string | undefined} pathext - process.env.PATHEXT (or undefined).
 * @param {boolean} isWindows
 * @returns {string[]} extensions to try, in order, always ending in ''.
 */
export function buildPathExtCandidates(pathext: string | undefined, isWindows: boolean): string[] {
  if (!isWindows) {
    return ['']
  }

  return [...(pathext || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean), '']
}

/**
 * Choose the Windows bootstrap-recovery invocation. The gentle in-place
 * updater can only start when both pieces of its runtime contract exist: the
 * venv Python interpreter and the Aegis AI Enterprise Autonomous Platform launcher that drives `aegis update`.
 * A bootstrap-complete marker proves install provenance, not current runtime
 * usability, and may remain after the venv is removed or quarantined.
 *
 * @param {BootstrapRecoverySignals} signals
 * @param {string} branch
 * @returns {string[]} updater argv, e.g. ['--update', '--branch', 'main'].
 */
export interface BootstrapRecoverySignals {
  runtimeUsable: boolean
}

export function chooseUpdaterArgs(signals: BootstrapRecoverySignals, branch: string): string[] {
  return signals.runtimeUsable ? ['--update', '--branch', branch] : ['--repair', '--branch', branch]
}

export interface ResolveVenvAegis AI Enterprise Autonomous PlatformCommandDeps {
  isWindows: boolean
  isCommandScript: (command: string) => boolean
  fileExists: (filePath: string) => boolean
  directoryExists: (filePath: string) => boolean
  canImportAegis AI Enterprise Autonomous PlatformCli: (python: string, opts?: { env?: Record<string, string>; cwd?: string }) => Promise<boolean>
  getVenvPython: (venvRoot: string) => string
  buildDesktopBackendEnv: () => Record<string, string>
  resolvePath: (...segments: string[]) => string
  dirname: (p: string) => string
  basename: (p: string) => string
  rememberLog?: (message: string) => void
}

/**
 * If `command` is a Windows venv `aegis`/`aegis.exe` console-script shim
 * (i.e. `<venvRoot>/Scripts/aegis(.exe)`), resolve it to the underlying
 * venv python invoked as `python -m aegis_cli.main <backendArgs>` — but
 * ONLY after smoke-testing that interpreter with canImportAegis AI Enterprise Autonomous PlatformCli(). A
 * venv whose update died mid-`pip install` still has python.exe + aegis.exe
 * on disk, but the backend dies on its first import (e.g.
 * ModuleNotFoundError: dotenv) before the gateway ever binds. Returning it
 * unprobed also bypasses the caller's `--version` probe, so Retry/"Repair
 * install" re-resolves the same broken venv forever instead of falling
 * through to the bootstrap installer.
 *
 * Mirrors isSourceRuntimeUsable() in main.ts: probes with the checkout on PYTHONPATH so
 * a healthy source-tree venv passes.
 *
 * Returns null when `command` is not a venv aegis shim, the underlying
 * python doesn't exist, or the import probe fails. Otherwise returns the
 * resolved backend descriptor.
 */
export async function resolveVenvAegis AI Enterprise Autonomous PlatformCommand(
  command: string,
  backendArgs: string[],
  deps: ResolveVenvAegis AI Enterprise Autonomous PlatformCommandDeps
): Promise<{
  label: string
  command: string
  args: string[]
  bootstrap: false
  env: Record<string, string>
  kind: 'python'
  root: string
  shell: false
} | null> {
  const {
    isWindows,
    isCommandScript,
    fileExists,
    directoryExists,
    canImportAegis AI Enterprise Autonomous PlatformCli,
    getVenvPython,
    buildDesktopBackendEnv,
    resolvePath,
    dirname,
    basename,
    rememberLog
  } = deps

  if (!isWindows || !command || isCommandScript(command)) {
    return null
  }

  const resolved = resolvePath(String(command))

  if (!/^aegis(?:\.exe)?$/i.test(basename(resolved))) {
    return null
  }

  const scriptsDir = dirname(resolved)

  if (basename(scriptsDir).toLowerCase() !== 'scripts') {
    return null
  }

  const venvRoot = dirname(scriptsDir)
  const python = getVenvPython(venvRoot)

  if (!fileExists(python)) {
    return null
  }

  const root = dirname(venvRoot)

  // Probe with the same semantics the real spawn uses: venv interpreter,
  // cwd at the checkout root, no PYTHONPATH.
  if (!(await canImportAegis AI Enterprise Autonomous PlatformCli(python, { cwd: directoryExists(root) ? root : undefined }))) {
    rememberLog?.(
      `Ignoring venv Aegis AI Enterprise Autonomous Platform at ${python}: runtime import probe failed (broken/partial venv); falling through to bootstrap.`
    )

    return null
  }

  return {
    label: `existing Aegis AI Enterprise Autonomous Platform Python at ${python}`,
    command: python,
    args: ['-m', 'aegis_cli.main', ...backendArgs],
    bootstrap: false,
    env: buildDesktopBackendEnv(),
    kind: 'python',
    root,
    shell: false
  }
}
