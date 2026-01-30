import { useEffect } from "react";
import type { PropsWithChildren } from "react";

import { applyTheme, getTheme } from "../lib/theme";
import { AuthProvider } from "../features/auth/AuthContext";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
