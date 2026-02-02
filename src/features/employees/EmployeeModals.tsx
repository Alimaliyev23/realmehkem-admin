import React from "react";
import type {
  DepartmentApi,
  StoreApi,
  RoleApi,
  EmployeeApi,
} from "../employees/types";
import type { EmployeeFormState } from "./employeeForm";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {title}
          </h3>
          <Button variant="ghost" onClick={onClose}>
            Bağla
          </Button>
        </div>
        <div className="p-4 text-gray-900 dark:text-slate-100">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-gray-600 dark:text-slate-400">{label}</span>
      {children}
      {error ? <div className="text-xs text-red-500">{error}</div> : null}
    </label>
  );
}

export function EmployeeViewModal({
  open,
  employee,
  departments,
  stores,
  roles,
  onClose,
  onEdit,
}: {
  open: boolean;
  employee: EmployeeApi | null;
  departments: DepartmentApi[];
  stores: StoreApi[];
  roles: RoleApi[];
  onClose: () => void;
  onEdit: (id: number) => void;
}) {
  if (!open) return null;

  const depNameById = (id: number) =>
    departments.find((d) => String(d.id) === String(id))?.name ?? "—";

  const storeNameById = (id: number | null) =>
    id == null
      ? "—"
      : (stores.find((s) => String(s.id) === String(id))?.name ?? "—");

  const roleNameById = (id: number) =>
    roles.find((r) => String(r.id) === String(id))?.name ?? "—";

  return (
    <Modal title="Əməkdaş məlumatı" onClose={onClose}>
      {!employee ? (
        <Loader />
      ) : (
        <div className="grid gap-4 text-sm">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Ad Soyad
            </div>
            <div className="mt-1 font-medium text-gray-900 dark:text-slate-100">
              {employee.fullName}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Email
              </div>
              <div className="mt-1">{employee.email}</div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Telefon
              </div>
              <div className="mt-1">{employee.phone}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Şöbə</div>
              <div>{depNameById(employee.departmentId)}</div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Filial</div>
              <div>{storeNameById(employee.storeId)}</div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Vəzifə</div>
              <div>{roleNameById(employee.roleId)}</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => onEdit(employee.id)}>
              Redaktə et
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function EmployeeFormModal({
  open,
  title,
  departments,
  stores,
  roles,
  form,
  setForm,
  saving,
  showDelete,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  title: string;
  departments: DepartmentApi[];
  stores: StoreApi[];
  roles: RoleApi[];
  form: EmployeeFormState;
  setForm: React.Dispatch<React.SetStateAction<EmployeeFormState>>;
  saving: boolean;
  showDelete?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}) {
  if (!open) return null;

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const fullName = (form.fullName || "").trim();
  const email = (form.email || "").trim();
  const phoneRaw = (form.phone || "").trim();
  const phone = phoneRaw.replace(/[()\s-]/g, "");

  const errors = {
    fullName: !fullName
      ? "Ad Soyad boş ola bilməz"
      : fullName.length < 3
        ? "Minimum 3 hərf olmalıdır"
        : /\d/.test(fullName)
          ? "Rəqəm olmaz"
          : "",
    email: !email
      ? "Email daxil edin"
      : !/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(email)
        ? "Yalnız Gmail qəbul olunur"
        : "",
    phone: !phone
      ? "Telefon daxil edin"
      : !/^\+?\d{9,13}$/.test(phone)
        ? "Telefon düzgün deyil"
        : "",
    departmentId: !form.departmentId ? "Şöbə seçilməlidir" : "",
    roleId: !form.roleId ? "Vəzifə seçilməlidir" : "",
    hireDate: !form.hireDate ? "Tarix seçilməlidir" : "",
    salaryBase:
      !form.salaryBase || Number(form.salaryBase) <= 0
        ? "Əmək haqqı 0 ola bilməz"
        : "",
  };

  const hasErrors = Object.values(errors).some(Boolean);

  function markAllTouched() {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      departmentId: true,
      roleId: true,
      hireDate: true,
      salaryBase: true,
    });
  }

  function handleSubmitClick() {
    markAllTouched();
    if (hasErrors) return;
    onSubmit();
  }

  const departmentSelectOptions = departments.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  const storeSelectOptions = stores.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const roleSelectOptions = roles.map((r) => ({
    value: String(r.id),
    label: r.name,
  }));

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-4">
        <Input
          label="Ad Soyad"
          value={form.fullName}
          onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
          error={touched.fullName ? errors.fullName : ""}
        />

        <Input
          label="Email"
          value={form.email}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          error={touched.email ? errors.email : ""}
        />

        <Input
          label="Telefon"
          value={form.phone}
          placeholder="+994501234567"
          onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          error={touched.phone ? errors.phone : ""}
        />

        {/* ✅ Select: Şöbə */}
        <Select
          label="Şöbə"
          value={form.departmentId}
          onBlur={() => setTouched((p) => ({ ...p, departmentId: true }))}
          onChange={(e) =>
            setForm((p) => ({ ...p, departmentId: e.target.value }))
          }
          error={touched.departmentId ? errors.departmentId : ""}
          options={departmentSelectOptions}
          placeholder="— seç —"
        />

        {/* ✅ Select: Filial */}
        <Select
          label="Filial"
          value={form.storeId}
          onChange={(e) => setForm((p) => ({ ...p, storeId: e.target.value }))}
          options={storeSelectOptions}
          placeholder="— yoxdur —"
        />

        {/* ✅ Select: Vəzifə */}
        <Select
          label="Vəzifə"
          value={form.roleId}
          onBlur={() => setTouched((p) => ({ ...p, roleId: true }))}
          onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
          error={touched.roleId ? errors.roleId : ""}
          options={roleSelectOptions}
          placeholder="— seç —"
        />

        <Input
          label="İşə qəbul tarixi"
          type="date"
          value={form.hireDate}
          onBlur={() => setTouched((p) => ({ ...p, hireDate: true }))}
          onChange={(e) => setForm((p) => ({ ...p, hireDate: e.target.value }))}
          error={touched.hireDate ? errors.hireDate : ""}
        />

        <Input
          label="Əmək haqqı (base)"
          type="number"
          value={form.salaryBase}
          onBlur={() => setTouched((p) => ({ ...p, salaryBase: true }))}
          onChange={(e) =>
            setForm((p) => ({ ...p, salaryBase: e.target.value }))
          }
          error={touched.salaryBase ? errors.salaryBase : ""}
        />

        <div className="flex justify-between pt-2">
          {showDelete ? (
            <Button
              variant="secondary"
              onClick={onDelete}
              loading={false}
              disabled={saving}
              className="border-red-300 text-red-700"
            >
              Sil
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Ləğv et
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmitClick}
              loading={saving}
              title={
                hasErrors ? "Zəhmət olmasa xətaları düzəldin" : "Yadda saxla"
              }
            >
              Yadda saxla
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
