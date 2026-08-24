/**
 * El Nuevo Sánchez brand palette.
 *
 * Source of truth: the official NS monogram (black field, gold ring +
 * wordmark). The gold is used as a strategic accent — CTAs, active states,
 * highlights, thin structural lines — never as a dominant surface color.
 * Denim tones exist to let product photography and industrial textures
 * breathe without falling back to generic ecommerce blue/gray.
 */

export const colorPalette = {
  ink: {
    0: "#ffffff",
    50: "#f7f7f6",
    100: "#eeeeec",
    200: "#d9d9d6",
    300: "#b6b6b1",
    400: "#8a8a84",
    500: "#615f59",
    600: "#454340",
    700: "#302e2c",
    800: "#1c1b1a",
    900: "#121110",
    950: "#0a0a09",
  },
  gold: {
    50: "#fdf8e2",
    100: "#faedb6",
    200: "#f6df80",
    300: "#f6d34f",
    400: "#f8c909",
    500: "#e0b400",
    600: "#b88f00",
    700: "#8f6f00",
    800: "#5c4800",
    900: "#332800",
  },
  denim: {
    50: "#eef3f8",
    100: "#d6e2ee",
    200: "#aec4dd",
    300: "#82a3c8",
    400: "#5c81ab",
    500: "#3f628a",
    600: "#2f4d6f",
    700: "#233a55",
    800: "#17263a",
    900: "#0f1a28",
    wash: "#7d97ad",
    raw: "#1e2f44",
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
    background: colorPalette.ink[0],
    foreground: colorPalette.ink[950],
    surface: colorPalette.ink[50],
    surfaceElevated: colorPalette.ink[0],
    surfaceInverted: colorPalette.ink[950],
    muted: colorPalette.ink[500],
    mutedForeground: colorPalette.ink[500],
    border: colorPalette.ink[200],
    borderStrong: colorPalette.ink[300],
    accent: colorPalette.gold[400],
    accentForeground: colorPalette.ink[950],
    accentStrong: colorPalette.gold[500],
    denim: colorPalette.denim[600],
    denimForeground: colorPalette.ink[0],
    success: colorPalette.success[600],
    successForeground: colorPalette.ink[0],
    warning: colorPalette.warning[600],
    warningForeground: colorPalette.ink[950],
    danger: colorPalette.danger[600],
    dangerForeground: colorPalette.ink[0],
    focusRing: colorPalette.gold[500],
    overlay: "rgba(10, 10, 9, 0.6)",
  },
  dark: {
    background: colorPalette.ink[950],
    foreground: colorPalette.ink[50],
    surface: colorPalette.ink[900],
    surfaceElevated: colorPalette.ink[800],
    surfaceInverted: colorPalette.ink[0],
    muted: colorPalette.ink[400],
    mutedForeground: colorPalette.ink[400],
    border: colorPalette.ink[700],
    borderStrong: colorPalette.ink[600],
    accent: colorPalette.gold[400],
    accentForeground: colorPalette.ink[950],
    accentStrong: colorPalette.gold[300],
    denim: colorPalette.denim[400],
    denimForeground: colorPalette.ink[950],
    success: colorPalette.success[500],
    successForeground: colorPalette.ink[950],
    warning: colorPalette.warning[500],
    warningForeground: colorPalette.ink[950],
    danger: colorPalette.danger[500],
    dangerForeground: colorPalette.ink[950],
    focusRing: colorPalette.gold[400],
    overlay: "rgba(0, 0, 0, 0.72)",
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
