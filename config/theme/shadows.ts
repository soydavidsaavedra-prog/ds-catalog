/**
 * Elevation and shadow tokens for depth hierarchy.
 */

export const shadowScale = {
  none: "none",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
} as const;

export const shadows = {
  none: shadowScale.none,
  control: shadowScale.xs,
  surface: shadowScale.sm,
  card: shadowScale.md,
  overlay: shadowScale.lg,
  modal: shadowScale.xl,
} as const;

export const shadowTokens = {
  scale: shadowScale,
  semantic: shadows,
} as const;

export type ShadowScale = typeof shadowScale;
export type ShadowScaleToken = keyof ShadowScale;

export type Shadows = typeof shadows;
export type ShadowToken = keyof Shadows;

export type ShadowTokens = typeof shadowTokens;
