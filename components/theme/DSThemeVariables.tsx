import { getThemeCssText } from "@/engines/theme/to-css-custom-properties";

export function DSThemeVariables() {
  return (
    <style
      precedence="default"
      dangerouslySetInnerHTML={{ __html: getThemeCssText() }}
    />
  );
}
