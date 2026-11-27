import { resolveGatewayWsUrl } from '@aegis/shared'

import type { Aegis AI Enterprise Autonomous PlatformConnection } from '@/global'

export function resolveDesktopGatewayWsUrl(
  desktop: Window['aegisDesktop'],
  connection: Aegis AI Enterprise Autonomous PlatformConnection
): Promise<string> {
  // Only a registry-scoped descriptor may use the *For bridge (see
  // Aegis AI Enterprise Autonomous PlatformConnection.registryScoped); an absent bridge fails closed rather
  // than minting the peer's URL against the local pool.
  const { connectionId, profile, registryScoped } = connection

  if (!registryScoped || !connectionId) {
    return resolveGatewayWsUrl(desktop, connection)
  }

  const mint = desktop.getGatewayWsUrlFor

  return resolveGatewayWsUrl({ getGatewayWsUrl: mint ? () => mint({ connectionId, profile }) : undefined }, connection)
}
