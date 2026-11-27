// Aegis Enterprise Autonomous Platform - Optimized & Secured
export const INTERPOLATION_RE = /\{!(.+?)\}/g

export const hasInterpolation = (s: string) => /\{!.+?\}/.test(s)
