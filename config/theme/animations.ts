/**
 * Motion tokens for durations, easings, and transitions.
 * Keyframe definitions are named for reuse without framework coupling.
 */

export const duration = {
  instant: "0ms",
  fast: "120ms",
  normal: "200ms",
  slow: "320ms",
  slower: "480ms",
} as const;

export const easing = {
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  emphasis: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

export const transition = {
  fade: {
    property: "opacity",
    duration: duration.normal,
    easing: easing.out,
  },
  color: {
    property: "color, background-color, border-color",
    duration: duration.fast,
    easing: easing.inOut,
  },
  transform: {
    property: "transform",
    duration: duration.normal,
    easing: easing.emphasis,
  },
  layout: {
    property: "opacity, transform",
    duration: duration.slow,
    easing: easing.out,
  },
} as const;

export const motionPresets = {
  fadeIn: "fade-in",
  fadeOut: "fade-out",
  slideUp: "slide-up",
  slideDown: "slide-down",
  scaleIn: "scale-in",
} as const;

export const animations = {
  duration,
  easing,
  transition,
  motionPresets,
} as const;

export type Duration = typeof duration;
export type DurationToken = keyof Duration;

export type Easing = typeof easing;
export type EasingToken = keyof Easing;

export type Transition = typeof transition;
export type TransitionToken = keyof Transition;

export type MotionPreset = typeof motionPresets;
export type MotionPresetToken = keyof MotionPreset;

export type Animations = typeof animations;
