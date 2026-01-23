import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { applyTheme, getTheme } from "../lib/theme";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return <>{children}</>;
}
