"use client";

import { ReactNode, useEffect } from "react";
import { themeEngine } from "@/engines/theme/theme.engine";

type Props = {
  children: ReactNode;
};

export default function DSThemeProvider({
  children,
}: Props) {
  useEffect(() => {
    const theme = themeEngine.getTheme();

    document.documentElement.style.setProperty(
      "--ds-primary",
      theme.primary
    );

    document.documentElement.style.setProperty(
      "--ds-secondary",
      theme.secondary
    );
  }, []);

  return <>{children}</>;
}