import { semanticColors } from "@/config/theme/colors";
import { radius } from "@/config/theme/radius";
import { shadows } from "@/config/theme/shadows";

type SemanticColorMode = keyof typeof semanticColors;

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function buildVariableBlock(
  tokens: Record<string, string>,
): string {
  return Object.entries(tokens)
    .map(([key, value]) => `--${toKebabCase(key)}: ${value};`)
    .join("\n  ");
}

export function getThemeCssText(): string {
  const sharedTokens = [
    `--radius-control: ${radius.control};`,
    `--shadow-surface: ${shadows.surface};`,
  ].join("\n  ");

  const lightBlock = buildVariableBlock(semanticColors.light);
  const darkBlock = buildVariableBlock(semanticColors.dark);

  return `:root {
  ${lightBlock}
  ${sharedTokens}
}

@media (prefers-color-scheme: dark) {
  :root {
    ${darkBlock}
  }
}`;
}

export function getSemanticColorVariables(
  mode: SemanticColorMode,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(semanticColors[mode]).map(([key, value]) => [
      `--${toKebabCase(key)}`,
      value,
    ]),
  );
}
