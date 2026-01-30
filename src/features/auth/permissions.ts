import type { AuthUser } from "./types";

export type Permissions = {
  canViewEmployees: boolean;
  canCreateEmployee: boolean;
  canEditEmployee: boolean;
  canDeleteEmployee: boolean;
  limitToStoreId: string | null;
};

export function getPermissions(user: AuthUser | null): Permissions {
  if (!user) {
    return {
      canViewEmployees: false,
      canCreateEmployee: false,
      canEditEmployee: false,
      canDeleteEmployee: false,
      limitToStoreId: null,
    };
  }

  if (user.role === "admin") {
    return {
      canViewEmployees: true,
      canCreateEmployee: true,
      canEditEmployee: true,
      canDeleteEmployee: true,
      limitToStoreId: null,
    };
  }

  if (user.role === "hr") {

    return {
      canViewEmployees: true,
      canCreateEmployee: true,
      canEditEmployee: true,
      canDeleteEmployee: false,
      limitToStoreId: null,
    };
  }

  return {
    canViewEmployees: true,
    canCreateEmployee: false,
    canEditEmployee: false,
    canDeleteEmployee: false,
    limitToStoreId: user.storeId ?? null,
  };
}
