/**
 * Spacing scale and semantic spacing aliases.
 * Values use rem for accessibility and consistent scaling.
 */

export const spacingScale = {
  0: "0rem",
  px: "0.0625rem",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const spacing = {
  none: spacingScale[0],
  xs: spacingScale[1],
  sm: spacingScale[2],
  md: spacingScale[4],
  lg: spacingScale[6],
  xl: spacingScale[8],
  "2xl": spacingScale[12],
  "3xl": spacingScale[16],
} as const;

export const layoutSpacing = {
  pagePaddingX: spacing.md,
  pagePaddingY: spacing.lg,
  sectionGap: spacing.xl,
  stackGap: spacing.sm,
  inlineGap: spacing.sm,
  cardPadding: spacing.md,
  inputPaddingX: spacing.sm,
  inputPaddingY: spacing.xs,
} as const;

export const spacingTokens = {
  scale: spacingScale,
  semantic: spacing,
  layout: layoutSpacing,
} as const;

export type SpacingScale = typeof spacingScale;
export type SpacingScaleToken = keyof SpacingScale;

export type Spacing = typeof spacing;
export type SpacingToken = keyof Spacing;

export type LayoutSpacing = typeof layoutSpacing;
export type LayoutSpacingToken = keyof LayoutSpacing;

export type SpacingTokens = typeof spacingTokens;
