import type { Usage } from '@aegis/shared/gateway-events'

export { usageFromTick } from '@aegis/shared/usage-tick'

export const ZERO: Usage = { calls: 0, input: 0, output: 0, total: 0 }
