/**
 * Color palette and semantic color tokens.
 * Raw scales are theme-agnostic; semantic tokens express UI intent.
 */

export const colorPalette = {
  neutral: {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
  accent: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
    950: "#082f49",
  },
  success: {
    50: "#f0fdf4",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
  },
  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  danger: {
    50: "#fef2f2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
} as const;

export const semanticColors = {
  light: {
    background: colorPalette.neutral[0],
    foreground: colorPalette.neutral[900],
    surface: colorPalette.neutral[50],
    surfaceElevated: colorPalette.neutral[0],
    muted: colorPalette.neutral[500],
    mutedForeground: colorPalette.neutral[500],
    border: colorPalette.neutral[200],
    borderStrong: colorPalette.neutral[300],
    accent: colorPalette.accent[600],
    accentForeground: colorPalette.neutral[0],
    success: colorPalette.success[600],
    successForeground: colorPalette.neutral[0],
    warning: colorPalette.warning[600],
    warningForeground: colorPalette.neutral[900],
    danger: colorPalette.danger[600],
    dangerForeground: colorPalette.neutral[0],
    focusRing: colorPalette.accent[500],
    overlay: "rgba(10, 10, 10, 0.48)",
  },
  dark: {
    background: colorPalette.neutral[950],
    foreground: colorPalette.neutral[50],
    surface: colorPalette.neutral[900],
    surfaceElevated: colorPalette.neutral[800],
    muted: colorPalette.neutral[400],
    mutedForeground: colorPalette.neutral[400],
    border: colorPalette.neutral[800],
    borderStrong: colorPalette.neutral[700],
    accent: colorPalette.accent[400],
    accentForeground: colorPalette.neutral[950],
    success: colorPalette.success[500],
    successForeground: colorPalette.neutral[950],
    warning: colorPalette.warning[500],
    warningForeground: colorPalette.neutral[950],
    danger: colorPalette.danger[500],
    dangerForeground: colorPalette.neutral[950],
    focusRing: colorPalette.accent[400],
    overlay: "rgba(0, 0, 0, 0.64)",
  },
} as const;

export const colors = {
  palette: colorPalette,
  semantic: semanticColors,
} as const;

export type ColorPalette = typeof colorPalette;
export type ColorPaletteScale = keyof ColorPalette;
export type ColorPaletteStep<TScale extends ColorPaletteScale> =
  keyof ColorPalette[TScale];

export type SemanticColorMode = keyof typeof semanticColors;
export type SemanticColorToken = keyof typeof semanticColors.light;

export type Colors = typeof colors;
