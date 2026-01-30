import React, { createContext, useContext, useMemo, useState } from "react";
import type { AuthUser, LoginCredentials } from "./types";
import { loadAuthUser, saveAuthUser } from "./storage";
import { loginRequest } from "./authApi";
import { getPermissions, type Permissions } from "./permissions";

type AuthContextValue = {
  user: AuthUser | null;
  permissions: Permissions;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadAuthUser());

  const permissions = useMemo(() => getPermissions(user), [user]);

  async function login(creds: LoginCredentials) {
    const u = await loginRequest(creds);
    setUser(u);
    saveAuthUser(u);
  }

  function logout() {
    setUser(null);
    saveAuthUser(null);
  }

  const value: AuthContextValue = {
    user,
    permissions,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
