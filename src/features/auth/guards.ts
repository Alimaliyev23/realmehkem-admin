import type { EmployeeApi } from "../employees/types";

export type Permissions = {
  canCreateEmployee: boolean;
  canEditEmployee: boolean;
  canDeleteEmployee: boolean;
  limitToStoreId: string | null;
};

function sameStore(empStoreId: number | null, limitStoreId: string | null) {
  if (!limitStoreId) return true;
  if (empStoreId == null) return false;
  return String(empStoreId) === limitStoreId;
}

export function canCreateEmployee(p: Permissions) {
  return p.canCreateEmployee;
}

export function canEditEmployee(emp: EmployeeApi, p: Permissions) {
  if (!p.canEditEmployee)
    return { ok: false as const, reason: "no_permission" as const };
  if (!sameStore(emp.storeId, p.limitToStoreId))
    return { ok: false as const, reason: "cross_store" as const };
  return { ok: true as const };
}

export function canDeleteEmployee(emp: EmployeeApi, p: Permissions) {
  if (!p.canDeleteEmployee)
    return { ok: false as const, reason: "no_permission" as const };
  if (!sameStore(emp.storeId, p.limitToStoreId))
    return { ok: false as const, reason: "cross_store" as const };
  return { ok: true as const };
}

export function guardMessage(reason: "no_permission" | "cross_store") {
  if (reason === "no_permission") return "Bu əməliyyat üçün icazən yoxdur.";
  return "Yalnız öz filialının əməkdaşları üçün bu əməliyyatı edə bilərsən.";
}
