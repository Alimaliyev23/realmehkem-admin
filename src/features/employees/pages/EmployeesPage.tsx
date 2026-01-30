import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DataTable, type ColumnDef } from "../../../components/ui/DataTable";
import type { EmployeeApi, EmployeeRow } from "../types";
import { useEmployeesData } from "../useEmployeesData";
import { EmployeeFormModal, EmployeeViewModal } from "../EmployeeModals";
import {
  toApiPayload,
  toFormState,
  type EmployeeFormState,
} from "../employeeForm";

import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../../lib/api";

function sameStore(empStoreId: number | null, limitStoreId: string | null) {
  if (!limitStoreId) return true;
  if (empStoreId == null) return false;
  return String(empStoreId) === limitStoreId;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost<TBody, TRes>(path: string, body: TBody): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPut<TBody, TRes>(path: string, body: TBody): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

function nowIso() {
  return new Date().toISOString();
}

async function writeAudit(body: {
  actorId: number;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, any>;
}) {
  try {
    await apiPost("/auditLogs", {
      ...body,
      at: nowIso(),
    });
  } catch (err) {
    console.warn("Audit yazılmadı:", err);
  }
}

function isValidGmail(email: string) {
  return /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email.trim());
}

function isValidFullName(name: string) {
  const v = name.trim();
  if (v.length < 3) return false;
  if (/\d/.test(v)) return false;
  // AZ hərfləri + boşluq + - + '
  if (!/^[A-Za-zƏÖÜĞÇŞİIəöüğçşı \-']+$/.test(v)) return false;
  return true;
}

function isValidISODate(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const [yS, mS, dS] = dateStr.split("-");
  const y = Number(yS);
  const m = Number(mS);
  const d = Number(dS);

  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d))
    return false;
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const dt = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return false;

  return (
    dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d
  );
}

export default function EmployeesPage() {
  const { user, permissions } = useAuth();

  const {
    rows,
    loading,
    refresh,
    departments,
    stores,
    roles,
    departmentOptions,
    roleOptions,
    statusOptions,
  } = useEmployeesData();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialQ);

  function updateUrlQ(v: string) {
    const clean = v.trim();
    const next = new URLSearchParams(searchParams);
    if (clean) next.set("q", clean);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [activeEmployee, setActiveEmployee] = useState<EmployeeApi | null>(
    null,
  );

  const [form, setForm] = useState<EmployeeFormState>(() => toFormState());
  const [saving, setSaving] = useState(false);

  const visibleRows = useMemo(() => {
    const limit = permissions.limitToStoreId;
    if (!limit) return rows;

    return rows.filter((r) => String((r as any).storeId ?? "") === limit);
  }, [rows, permissions.limitToStoreId]);

  function ensureCanCreate() {
    if (!permissions.canCreateEmployee) {
      alert("Yeni əməkdaş əlavə etməyə icazən yoxdur.");
      throw new Error("Not allowed: create employee");
    }
  }

  function ensureCanEdit(emp: EmployeeApi) {
    if (!permissions.canEditEmployee) {
      alert("Redaktə etməyə icazən yoxdur.");
      throw new Error("Not allowed: edit employee");
    }

    if (!sameStore(emp.storeId, permissions.limitToStoreId)) {
      alert("Yalnız öz filialının əməkdaşlarını redaktə edə bilərsən.");
      throw new Error("Cross-store edit blocked");
    }
  }

  function ensureCanDelete(emp: EmployeeApi) {
    if (!permissions.canDeleteEmployee) {
      alert("Silməyə icazən yoxdur.");
      throw new Error("Not allowed: delete employee");
    }

    if (!sameStore(emp.storeId, permissions.limitToStoreId)) {
      alert("Yalnız öz filialının əməkdaşlarını silə bilərsən.");
      throw new Error("Cross-store delete blocked");
    }
  }

  async function openView(id: number) {
    setViewOpen(true);
    setActiveEmployee(null);
    setActiveEmployee(await apiGet<EmployeeApi>(`/employees/${id}`));
  }

  async function openEdit(id: number) {
    const emp = await apiGet<EmployeeApi>(`/employees/${id}`);

    ensureCanEdit(emp);

    setFormOpen(true);
    setEditId(id);
    setActiveEmployee(emp);
    setForm(toFormState(emp));
  }

  const columns: ColumnDef<EmployeeRow>[] = useMemo(
    () => [
      { key: "fullName", header: "Ad Soyad", enableColumnFilter: false },
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
        enableColumnFilter: false,
        cell: (e) => e.storeName ?? "—",
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
        enableSorting: true,
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
        className: "w-[180px]",
        enableColumnFilter: false,
        cell: (e) => (
          <div className="flex gap-2">
            <button
              onClick={() => openView(e.id)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Bax
            </button>

            {permissions.canEditEmployee && (
              <button
                onClick={() => openEdit(e.id)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Redaktə
              </button>
            )}
          </div>
        ),
      },
    ],
    [
      departmentOptions,
      roleOptions,
      statusOptions,
      permissions.canEditEmployee,
    ],
  );

  async function submit() {
    if (editId == null) ensureCanCreate();

    const name = form.fullName.trim();
    const email = form.email.trim();

    if (!isValidFullName(name))
      return alert(
        "Ad Soyad: minimum 3 hərf olmalıdır, rəqəm və icazəsiz simvol olmaz.",
      );

    if (!isValidGmail(email))
      return alert(
        "Email yalnız Gmail formatında olmalıdır (example@gmail.com).",
      );

    if (!form.departmentId) return alert("Şöbə seçilməlidir.");
    if (!form.roleId) return alert("Vəzifə seçilməlidir.");

    if (!form.hireDate || !isValidISODate(form.hireDate))
      return alert(
        "Tarix düzgün deyil. Format: YYYY-MM-DD və real tarix olmalıdır.",
      );

    const base = Number(form.salaryBase);
    if (!Number.isFinite(base) || base <= 0)
      return alert("Əmək haqqı (base) 0 ola bilməz. Minimum 1 yazın.");

    const bonus = Number(form.salaryBonus || 0);
    if (!Number.isFinite(bonus) || bonus < 0)
      return alert("Bonus mənfi ola bilməz.");

    setSaving(true);
    try {
      if (editId != null && activeEmployee) {
        ensureCanEdit(activeEmployee);

        const payload = toApiPayload(form, activeEmployee);
        await apiPut(`/employees/${editId}`, { ...payload, id: editId });

        await writeAudit({
          actorId: user?.id ?? 0,
          action: "employee.update",
          entity: "employees",
          entityId: String(editId),
          meta: { fullName: payload.fullName },
        });
      } else {
        const payload = toApiPayload(form);

        const created = await apiPost<unknown, EmployeeApi>(
          `/employees`,
          payload,
        );

        await writeAudit({
          actorId: user?.id ?? 0,
          action: "employee.create",
          entity: "employees",
          entityId: String(created.id),
          meta: { fullName: created.fullName },
        });
      }

      await refresh();

      setFormOpen(false);
      setEditId(null);
      setActiveEmployee(null);
    } catch (err) {
      console.error(err);
      alert("Server xətası oldu. Console-a bax (F12 -> Console).");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!activeEmployee) return;

    ensureCanDelete(activeEmployee);

    if (!confirm("Bu əməkdaşı silmək istəyirsiniz?")) return;

    setSaving(true);
    try {
      await apiDelete(`/employees/${activeEmployee.id}`);

      await writeAudit({
        actorId: user?.id ?? 0,
        action: "employee.delete",
        entity: "employees",
        entityId: String(activeEmployee.id),
        meta: { fullName: activeEmployee.fullName },
      });

      await refresh();

      setFormOpen(false);
      setEditId(null);
      setActiveEmployee(null);
    } catch (err) {
      console.error(err);
      alert("Silinmə zamanı xəta baş verdi.");
    } finally {
      setSaving(false);
    }
  }

  const canCreate = permissions.canCreateEmployee;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Employees</h2>

        {canCreate && (
          <button
            onClick={() => {
              setFormOpen(true);
              setEditId(null);
              setActiveEmployee(null);
              setForm(toFormState());
            }}
            className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Yeni əməkdaş
          </button>
        )}
      </div>

      <DataTable<EmployeeRow>
        rows={visibleRows}
        columns={columns}
        getRowKey={(e) => String(e.id)}
        isLoading={loading}
        emptyText="Heç bir əməkdaş tapılmadı"
        globalSearchPlaceholder="Ad üzrə axtar…"
        globalSearchKeys={["fullName"]}
        globalFilterValue={search}
        onGlobalFilterValueChange={(v) => {
          setSearch(v);
          updateUrlQ(v);
        }}
      />

      <EmployeeViewModal
        open={viewOpen}
        employee={activeEmployee}
        departments={departments}
        stores={stores}
        roles={roles}
        onClose={() => {
          setViewOpen(false);
          setActiveEmployee(null);
        }}
        onEdit={async (id) => {
          try {
            setViewOpen(false);
            await openEdit(id);
          } catch {
          }
        }}
      />

      <EmployeeFormModal
        open={formOpen}
        title={editId != null ? "Əməkdaşı redaktə et" : "Yeni əməkdaş"}
        departments={departments}
        stores={stores}
        roles={roles}
        form={form}
        setForm={setForm}
        saving={saving}
        showDelete={editId != null && permissions.canDeleteEmployee}
        onClose={() => {
          setFormOpen(false);
          setEditId(null);
          setActiveEmployee(null);
        }}
        onSubmit={submit}
        onDelete={remove}
      />
    </div>
  );
}
