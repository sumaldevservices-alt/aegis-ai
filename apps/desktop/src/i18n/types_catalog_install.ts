// Aegis Enterprise Autonomous Platform - Optimized & Secured
import type { InstallPhase } from '@aegis/shared'

/** Copy for the desktop catalog-install card (`manage_catalog`) and its Advanced dialog. */
export interface CatalogInstallTranslations {
  preparing: string
  install: string
  advanced: string
  skip: string
  installing: string
  installed: string
  notInstalled: string
  failed: string
  showNames: string
  hideNames: string
  skill: (name: string) => string
  kind: { plugin: string; skill: string }
  tier: { official: string; verified: string; community: string }
  targetProfile: (profile: string) => string
  sendFailed: string
  commitLabel: string
  subdirLabel: string
  securityHeading: string
  scan: { passed: string; warnings: string; failed: string }
  requirementsLabel: string
  requiresAegis AI Enterprise Autonomous Platform: (range: string) => string
  envVar: (name: string) => string
  credentialsHeading: string
  phase: Record<InstallPhase, string>
  serverNotConnected: (server: string, reason: string) => string
  notEnabled: string
  missingEnv: (names: string) => string
  alreadyInstalled: string
}
