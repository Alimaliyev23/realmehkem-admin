import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";

import { applyTheme, getTheme } from "../lib/theme";
import { AuthProvider } from "../features/auth/AuthContext";
import { apiGet } from "../lib/api";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppBootLoader } from "../components/ui/AppBootLoader";

export function AppProviders({ children }: PropsWithChildren) {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  useEffect(() => {
    apiGet("/companies")
      .catch(() => {})
      .finally(() => setBooting(false));
  }, []);

  return (
    <AuthProvider>
      <AppBootLoader show={booting} />
      {children}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
    </AuthProvider>
  );
}
