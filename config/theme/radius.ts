/**
 * Border radius scale and semantic radius aliases.
 */

export const radiusScale = {
  none: "0rem",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

export const radius = {
  none: radiusScale.none,
  control: radiusScale.md,
  surface: radiusScale.lg,
  card: radiusScale.xl,
  modal: radiusScale["2xl"],
  pill: radiusScale.full,
} as const;

export const radiusTokens = {
  scale: radiusScale,
  semantic: radius,
} as const;

export type RadiusScale = typeof radiusScale;
export type RadiusScaleToken = keyof RadiusScale;

export type Radius = typeof radius;
export type RadiusToken = keyof Radius;

export type RadiusTokens = typeof radiusTokens;
