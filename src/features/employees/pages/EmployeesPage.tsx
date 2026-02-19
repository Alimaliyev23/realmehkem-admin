// src/features/employees/pages/EmployeesPage.tsx
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DataTable, type ColumnDef } from "../../../components/ui/DataTable";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";

import type { EmployeeRow } from "../types";
import { useEmployeesData } from "../useEmployeesData";
import { EmployeeFormModal, EmployeeViewModal } from "../EmployeeModals";
import { toFormState, type EmployeeFormState } from "../employeeForm";

import { useAuth } from "../../auth/AuthContext";
import { useEmployeeActions } from "../hooks/useEmployeeActions";
import { canCreateEmployee } from "../../auth/guards";

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
  const [form, setForm] = useState<EmployeeFormState>(() => toFormState());

  const actions = useEmployeeActions({
    userId: user?.id ?? null,
    role: user?.role ?? null,
    permissions,
    departments,
    stores,
    roles,
    refresh,
    form,
    setForm,
    setFormOpen,
    setViewOpen,
  });

  // Store limit (store_manager üçün)
  const visibleRows = useMemo(() => {
    const limit = permissions.limitToStoreId;
    if (!limit) return rows;
    return rows.filter(
      (r) => String((r as any).storeId ?? "") === String(limit),
    );
  }, [rows, permissions.limitToStoreId]);

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
        enableColumnFilter: false,
        sortValue: (e) => e.salary?.base ?? 0,
        cell: (e) => `${e.salary.base.toLocaleString()} ${e.salary.currency}`,
      },

      {
        key: "hiredAt",
        header: "İşə qəbul",
        enableSorting: true,
        enableColumnFilter: false,
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
            {e.status === "active"
              ? "Aktiv"
              : e.status === "on_leave"
                ? "Məzuniyyətdə"
                : "Xitam"}
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
              onClick={() => actions.openView(e.id)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/10"
            >
              Bax
            </button>

            {permissions.canEditEmployee && (
              <button
                onClick={() => actions.openEdit(e.id)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/10"
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
      actions,
    ],
  );

  const canCreate = canCreateEmployee(permissions);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Employees</h2>

        <div className="flex gap-2">
          {actions.canExport && (
            <button
              onClick={actions.exportExcel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/10"
            >
              Export (Excel)
            </button>
          )}

          {canCreate && (
            <button
              onClick={actions.openCreate}
              className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Yeni əməkdaş
            </button>
          )}
        </div>
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
        employee={actions.activeEmployee}
        departments={departments}
        stores={stores}
        roles={roles}
        onClose={() => {
          setViewOpen(false);
          actions.setActiveEmployee(null);
        }}
        onEdit={async (id) => {
          setViewOpen(false);
          await actions.openEdit(id);
        }}
      />

      <EmployeeFormModal
        open={formOpen}
        title={actions.editId != null ? "Əməkdaşı redaktə et" : "Yeni əməkdaş"}
        departments={departments}
        stores={stores}
        roles={roles}
        form={form}
        setForm={setForm}
        saving={actions.saving}
        showDelete={actions.editId != null && permissions.canDeleteEmployee}
        onClose={() => {
          setFormOpen(false);
          actions.setEditId(null);
          actions.setActiveEmployee(null);
        }}
        onSubmit={actions.submit}
        onDelete={actions.askRemove}
      />

      <ConfirmModal
        open={actions.confirmOpen}
        title="Əməkdaşı sil"
        description={
          actions.activeEmployee
            ? `"${actions.activeEmployee.fullName}" adlı əməkdaşı silmək istəyirsiniz? Bu əməliyyat geri qaytarılmaya bilər.`
            : "Bu əməliyyatı təsdiqləyirsiniz?"
        }
        confirmText="Sil"
        cancelText="Ləğv et"
        loading={actions.saving}
        danger
        onClose={() => actions.setConfirmOpen(false)}
        onConfirm={actions.confirmRemove}
      />
    </div>
  );
}
