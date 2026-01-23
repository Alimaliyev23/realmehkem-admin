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

const API_BASE_URL = "http://127.0.0.1:3001";

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

export default function EmployeesPage() {
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

  // ✅ URL query: /employees?q=...
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
        className: "w-[160px]",
        enableColumnFilter: false,
        cell: (e) => (
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setViewOpen(true);
                setActiveEmployee(null);
                setActiveEmployee(
                  await apiGet<EmployeeApi>(`/employees/${e.id}`),
                );
              }}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Bax
            </button>

            <button
              onClick={async () => {
                setFormOpen(true);
                setEditId(e.id);
                const emp = await apiGet<EmployeeApi>(`/employees/${e.id}`);
                setActiveEmployee(emp);
                setForm(toFormState(emp));
              }}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Redaktə
            </button>
          </div>
        ),
      },
    ],
    [departmentOptions, roleOptions, statusOptions],
  );

  async function submit() {
    if (!form.fullName.trim()) return alert("Ad Soyad boş ola bilməz.");
    if (!form.departmentId) return alert("Şöbə seçilməlidir.");
    if (!form.roleId) return alert("Vəzifə seçilməlidir.");
    if (!form.hireDate) return alert("İşə qəbul tarixi seçilməlidir.");

    setSaving(true);
    try {
      if (editId != null && activeEmployee) {
        const payload = toApiPayload(form, activeEmployee);
        await apiPut(`/employees/${editId}`, { ...payload, id: editId });
      } else {
        const payload = toApiPayload(form);
        await apiPost(`/employees`, payload);
      }

      await refresh();

      setFormOpen(false);
      setEditId(null);
      setActiveEmployee(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!activeEmployee) return;
    if (!confirm("Bu əməkdaşı silmək istəyirsiniz?")) return;

    setSaving(true);
    try {
      await apiDelete(`/employees/${activeEmployee.id}`);
      await refresh();

      setFormOpen(false);
      setEditId(null);
      setActiveEmployee(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ✅ responsive page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Employees</h2>

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
      </div>

      <DataTable<EmployeeRow>
        rows={rows}
        columns={columns}
        getRowKey={(e) => String(e.id)}
        isLoading={loading}
        emptyText="Heç bir əməkdaş tapılmadı"
        globalSearchPlaceholder="Ad üzrə axtar…"
        globalSearchKeys={["fullName"]}
        // ✅ Header search -> URL (?q=...) -> DataTable global filter
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
          setViewOpen(false);
          setFormOpen(true);
          setEditId(id);

          const emp = await apiGet<EmployeeApi>(`/employees/${id}`);
          setActiveEmployee(emp);
          setForm(toFormState(emp));
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
        showDelete={editId != null}
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
