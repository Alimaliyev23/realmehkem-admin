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

  const visibleRows = useMemo(() => {
    const limit = permissions.limitToStoreId;
    if (!limit) return rows;
    return rows.filter((r) => String((r as any).storeId ?? "") === limit);
  }, [rows, permissions.limitToStoreId]);

  const columns: ColumnDef<EmployeeRow>[] = useMemo(
    () => [
      { key: "fullName", header: "Ad Soyad" },
      {
        key: "department",
        header: "Şöbə",
        filterVariant: "select",
        filterOptions: departmentOptions,
      },
      { key: "storeName", header: "Filial", cell: (e) => e.storeName ?? "—" },
      {
        key: "role",
        header: "Vəzifə",
        filterVariant: "select",
        filterOptions: roleOptions,
      },
      {
        key: "salary",
        header: "Əmək haqqı",
        sortValue: (e) => e.salary?.base ?? 0,
        cell: (e) => `${e.salary.base.toLocaleString()} ${e.salary.currency}`,
      },
      {
        key: "hiredAt",
        header: "İşə qəbul",
        sortValue: (e) => new Date(e.hiredAt).getTime(),
      },
      {
        key: "status",
        header: "Status",
        filterVariant: "select",
        filterOptions: statusOptions,
      },
      {
        key: "actions",
        header: "",
        cell: (e) => (
          <div className="flex gap-2">
            <button onClick={() => actions.openView(e.id)}>Bax</button>
            {permissions.canEditEmployee && (
              <button onClick={() => actions.openEdit(e.id)}>Redaktə</button>
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
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Employees</h2>

        <div className="flex gap-2">
          {actions.canExport && (
            <button onClick={actions.exportExcel}>Export</button>
          )}

          {canCreate && (
            <button onClick={actions.openCreate}>Yeni əməkdaş</button>
          )}
        </div>
      </div>

      <DataTable<EmployeeRow>
        rows={visibleRows}
        columns={columns}
        getRowKey={(e) => String(e.id)}
        isLoading={loading}
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
        title={actions.editId != null ? "Redaktə" : "Yeni əməkdaş"}
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
            ? `"${actions.activeEmployee.fullName}" silinsin?`
            : ""
        }
        loading={actions.saving}
        danger
        onClose={() => actions.setConfirmOpen(false)}
        onConfirm={actions.confirmRemove}
      />
    </div>
  );
}
