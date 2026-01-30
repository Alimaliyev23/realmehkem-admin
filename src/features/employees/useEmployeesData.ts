import { useCallback, useEffect, useState } from "react";
import type {
  EmployeeApi,
  EmployeeRow,
  DepartmentApi,
  StoreApi,
  RoleApi,
} from "../employees/types";
import { API_BASE_URL } from "../../lib/api";


async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useEmployeesData() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<DepartmentApi[]>([]);
  const [stores, setStores] = useState<StoreApi[]>([]);
  const [roles, setRoles] = useState<RoleApi[]>([]);

  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const [employees, dep, st, rl] = await Promise.all([
      apiGet<EmployeeApi[]>("/employees"),
      apiGet<DepartmentApi[]>("/departments"),
      apiGet<StoreApi[]>("/stores"),
      apiGet<RoleApi[]>("/roles"),
    ]);

    setDepartments(dep);
    setStores(st);
    setRoles(rl);

    const depMap = new Map(dep.map((d) => [String(d.id), d.name]));
    const storeMap = new Map(st.map((s) => [String(s.id), s.name]));
    const roleMap = new Map(rl.map((r) => [String(r.id), r.name]));

    const viewRows: EmployeeRow[] = employees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      department: depMap.get(String(e.departmentId)) ?? "—",
      storeId: e.storeId,
      storeName: e.storeId ? (storeMap.get(String(e.storeId)) ?? "—") : "—",
      role: roleMap.get(String(e.roleId)) ?? "—",
      salary: e.salary,
      hiredAt: e.hireDate,
      status: e.status,
    }));

    const deps = Array.from(
      new Set(viewRows.map((x) => x.department).filter((x) => x && x !== "—")),
    ).sort((a, b) => a.localeCompare(b));

    const rolesOpt = Array.from(
      new Set(viewRows.map((x) => x.role).filter((x) => x && x !== "—")),
    ).sort((a, b) => a.localeCompare(b));

    const statusOpt = Array.from(
      new Set(viewRows.map((x) => String(x.status)).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));

    setRows(viewRows);
    setDepartmentOptions(deps);
    setRoleOptions(rolesOpt);
    setStatusOptions(statusOpt);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    rows,
    loading,
    refresh,

    departments,
    stores,
    roles,

    departmentOptions,
    roleOptions,
    statusOptions,
  };
}
