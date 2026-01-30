import type { AuthUser } from "../auth/types";
import type { Permissions } from "../auth/permissions";

export type EmployeeLike = { storeId: string | null };

export function ensureCanEditEmployee(
  user: AuthUser | null,
  perms: Permissions,
  employee: EmployeeLike,
) {
  if (!user) throw new Error("Giriş tələb olunur");
  if (!perms.canEditEmployee) throw new Error("Edit icazən yoxdur");

  if (perms.limitToStoreId && employee.storeId !== perms.limitToStoreId) {
    throw new Error("Yalnız öz mağazan üzrə dəyişiklik edə bilərsən");
  }
}

export function ensureCanDeleteEmployee(
  user: AuthUser | null,
  perms: Permissions,
  employee: EmployeeLike,
) {
  if (!user) throw new Error("Giriş tələb olunur");
  if (!perms.canDeleteEmployee) throw new Error("Delete icazən yoxdur");

  if (perms.limitToStoreId && employee.storeId !== perms.limitToStoreId) {
    throw new Error("Yalnız öz mağazan üzrə silə bilərsən");
  }
}
