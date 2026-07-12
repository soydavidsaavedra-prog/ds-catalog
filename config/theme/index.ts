/**
 * DS Theme Engine — design token entry point.
 * Composes independent token modules into a single, typed theme contract.
 */

export {
  colorPalette,
  semanticColors,
  colors,
  type ColorPalette,
  type ColorPaletteScale,
  type ColorPaletteStep,
  type SemanticColorMode,
  type SemanticColorToken,
  type Colors,
} from "./colors";

export {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  typography,
  type FontFamily,
  type FontFamilyToken,
  type FontSize,
  type FontSizeToken,
  type FontWeight,
  type FontWeightToken,
  type LineHeight,
  type LineHeightToken,
  type LetterSpacing,
  type LetterSpacingToken,
  type TextStyle,
  type TextStyleToken,
  type Typography,
} from "./typography";

export {
  spacingScale,
  spacing,
  layoutSpacing,
  spacingTokens,
  type SpacingScale,
  type SpacingScaleToken,
  type Spacing,
  type SpacingToken,
  type LayoutSpacing,
  type LayoutSpacingToken,
  type SpacingTokens,
} from "./spacing";

export {
  radiusScale,
  radius,
  radiusTokens,
  type RadiusScale,
  type RadiusScaleToken,
  type Radius,
  type RadiusToken,
  type RadiusTokens,
} from "./radius";

export {
  shadowScale,
  shadows,
  shadowTokens,
  type ShadowScale,
  type ShadowScaleToken,
  type Shadows,
  type ShadowToken,
  type ShadowTokens,
} from "./shadows";

export {
  duration,
  easing,
  transition,
  motionPresets,
  animations,
  type Duration,
  type DurationToken,
  type Easing,
  type EasingToken,
  type Transition,
  type TransitionToken,
  type MotionPreset,
  type MotionPresetToken,
  type Animations,
} from "./animations";

import { colors } from "./colors";
import { typography } from "./typography";
import { spacingTokens } from "./spacing";
import { radiusTokens } from "./radius";
import { shadowTokens } from "./shadows";
import { animations } from "./animations";

export const theme = {
  colors,
  typography,
  spacing: spacingTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
  animations,
} as const;

export type Theme = typeof theme;

export type ThemeColorMode = keyof typeof theme.colors.semantic;
