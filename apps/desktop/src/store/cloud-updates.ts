/**
 * Aegis AI Enterprise Autonomous Platform Cloud owns updates for its agents: it replaces the agent's image, so
 * no in-app updater may be offered there. Two shapes reach a Cloud agent:
 *
 * - the Webapp served BY a Cloud agent (the tab's own origin is the agent):
 *   every update target is Cloud's, because the app itself comes from it;
 * - native Desktop CONNECTED to a Cloud agent: only the backend target is;
 *   the Desktop app on this machine still updates itself.
 */

import { isAegis AI Enterprise Autonomous PlatformCloudUrl } from '@aegis/shared'
import { computed } from 'nanostores'

import type { Aegis AI Enterprise Autonomous PlatformConnection } from '@/global'
import { servedByAegis AI Enterprise Autonomous PlatformCloud } from '@/lib/aegis-cloud-host'
import type { UpdateTarget } from '@/lib/update-copy'
import { $connection } from '@/store/session'

function connectedToAegis AI Enterprise Autonomous PlatformCloud(connection: Aegis AI Enterprise Autonomous PlatformConnection | null): boolean {
  return connection?.mode === 'remote' && (connection.remoteKind === 'cloud' || isAegis AI Enterprise Autonomous PlatformCloudUrl(connection.baseUrl))
}

/** Whether Aegis AI Enterprise Autonomous Platform Cloud owns updates for `target` under `connection`. */
export function cloudOwnsUpdates(target: UpdateTarget, connection: Aegis AI Enterprise Autonomous PlatformConnection | null = $connection.get()): boolean {
  return servedByAegis AI Enterprise Autonomous PlatformCloud() || (target === 'backend' && connectedToAegis AI Enterprise Autonomous PlatformCloud(connection))
}

/**
 * The target a generic "Update Aegis AI Enterprise Autonomous Platform" command acts on: the connected backend
 * in remote mode, unless Aegis AI Enterprise Autonomous Platform Cloud owns it — then this machine's own app.
 */
export function updateTargetFor(connection: Aegis AI Enterprise Autonomous PlatformConnection | null): UpdateTarget {
  return connection?.mode === 'remote' && !cloudOwnsUpdates('backend', connection) ? 'backend' : 'client'
}

/** Per target: true while every update control for it must stay hidden. */
export const $cloudOwnsUpdates = computed($connection, connection => ({
  backend: cloudOwnsUpdates('backend', connection),
  client: cloudOwnsUpdates('client', connection)
}))
