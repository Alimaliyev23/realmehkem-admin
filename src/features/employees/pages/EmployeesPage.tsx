import { useEffect, useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "../../../components/ui/DataTable";
import type {
  EmployeeApi,
  EmployeeRow,
  DepartmentApi,
  StoreApi,
  RoleApi,
} from "../types";

const API_BASE_URL = "http://127.0.0.1:3001";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export default function EmployeesPage() {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  // option-ları DataTable-a vermək üçün saxlayırıq
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const [employees, departments, stores, roles] = await Promise.all([
          apiGet<EmployeeApi[]>("/employees"),
          apiGet<DepartmentApi[]>("/departments"),
          apiGet<StoreApi[]>("/stores"),
          apiGet<RoleApi[]>("/roles"),
        ]);

        const depMap = new Map(departments.map((d) => [String(d.id), d.name]));
        const storeMap = new Map(stores.map((s) => [String(s.id), s.name]));
        const roleMap = new Map(roles.map((r) => [String(r.id), r.name]));

        const viewRows: EmployeeRow[] = employees.map((e) => ({
          id: e.id,
          fullName: e.fullName,
          department: depMap.get(String(e.departmentId)) ?? "—",
          storeName: e.storeId ? storeMap.get(String(e.storeId)) ?? "—" : "—",
          role: roleMap.get(String(e.roleId)) ?? "—",
          salary: e.salary,
          hiredAt: e.hireDate,
          status: e.status,
        }));

        console.log(
          typeof employees?.[0]?.departmentId,
          employees?.[0]?.departmentId
        );

        // filter select option-ları (unikal)
        const deps = Array.from(
          new Set(
            viewRows.map((x) => x.department).filter((x) => x && x !== "—")
          )
        ).sort((a, b) => a.localeCompare(b));

        const rolesOpt = Array.from(
          new Set(viewRows.map((x) => x.role).filter((x) => x && x !== "—"))
        ).sort((a, b) => a.localeCompare(b));

        const statusOpt = Array.from(
          new Set(viewRows.map((x) => String(x.status)).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        if (!cancelled) {
          setRows(viewRows);
          setDepartmentOptions(deps);
          setRoleOptions(rolesOpt);
          setStatusOptions(statusOpt);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: ColumnDef<EmployeeRow>[] = useMemo(
    () => [
      {
        key: "fullName",
        header: "Ad Soyad",
        enableColumnFilter: false, // global search ilə axtarırıq
      },
      {
        key: "department",
        header: "Şöbə",
        enableColumnFilter: true,
        filterVariant: "select",
        filterOptions: departmentOptions,
      },
      {
        key: "storeName",
        header: "Filial",
        cell: (e) => e.storeName ?? "—",
        enableColumnFilter: false,
      },
      {
        key: "role",
        header: "Vəzifə",
        enableColumnFilter: true,
        filterVariant: "select",
        filterOptions: roleOptions,
      },
      {
        key: "salary",
        header: "Əmək haqqı",
        enableSorting: true, // ✅ header klik sort
        sortValue: (e) => e.salary?.base ?? 0,
        cell: (e) => `${e.salary.base.toLocaleString()} ${e.salary.currency}`,
      },
      {
        key: "hiredAt",
        header: "İşə qəbul",
        enableSorting: true,
        sortValue: (e) => new Date(e.hiredAt).getTime(),
      },
      {
        key: "status",
        header: "Status",
        enableColumnFilter: true,
        filterVariant: "select",
        filterOptions: statusOptions,
        cell: (e) => (
          <span
            className={`inline-flex rounded px-2 py-1 text-xs ${
              e.status === "active"
                ? "bg-green-100 text-green-700"
                : e.status === "on_leave"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {e.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-[140px]",
        enableColumnFilter: false,
        cell: () => (
          <div className="flex gap-2">
            <button className="rounded border px-2 py-1 text-xs hover:bg-gray-50">
              Bax
            </button>
            <button className="rounded border px-2 py-1 text-xs hover:bg-gray-50">
              Redaktə
            </button>
          </div>
        ),
      },
    ],
    [departmentOptions, roleOptions, statusOptions]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Employees</h2>

        <button className="rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800">
          Yeni əməkdaş
        </button>
      </div>

      <DataTable<EmployeeRow>
        rows={rows}
        columns={columns}
        getRowKey={(e) => String(e.id)}
        isLoading={loading}
        emptyText="Heç bir əməkdaş tapılmadı"
        globalSearchPlaceholder="Ad üzrə axtar…"
        globalSearchKeys={["fullName"]}
      />
    </div>
  );
}
