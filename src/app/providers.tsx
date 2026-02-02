import { useEffect } from "react";
import type { PropsWithChildren } from "react";

import { applyTheme, getTheme } from "../lib/theme";
import { AuthProvider } from "../features/auth/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return (
    <AuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
    </AuthProvider>
  );
}
