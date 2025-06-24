"use client";

import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import { useServerInsertedHTML } from "next/navigation";

function useTheme() {
  const [theme, setTheme] = React.useState(webLightTheme);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setTheme(mediaQuery.matches ? webDarkTheme : webLightTheme);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return theme;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return <FluentProvider theme={theme}>{children}</FluentProvider>;
}
