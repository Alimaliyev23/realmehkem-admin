import React from "react";
import type {
  DepartmentApi,
  StoreApi,
  RoleApi,
  EmployeeApi,
} from "../employees/types";
import type { EmployeeFormState } from "./employeeForm";

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
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Bağla
          </button>
        </div>
        <div className="p-4 text-gray-900 dark:text-slate-100">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-gray-600 dark:text-slate-400">{label}</span>
      {children}
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
        <div className="text-sm text-gray-600 dark:text-slate-300">
          Yüklənir…
        </div>
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
            <button
              onClick={() => onEdit(employee.id)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Redaktə et
            </button>
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

  const inputCls =
    "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 " +
    "focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-white/10 dark:bg-white/5";

  const errorCls = "border-red-500";

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

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Ad Soyad">
          <input
            className={`${inputCls} ${
              touched.fullName && errors.fullName ? errorCls : ""
            }`}
            value={form.fullName}
            onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullName: e.target.value }))
            }
          />
          {touched.fullName && errors.fullName && (
            <div className="text-xs text-red-500">{errors.fullName}</div>
          )}
        </Field>

        <Field label="Email">
          <input
            className={`${inputCls} ${
              touched.email && errors.email ? errorCls : ""
            }`}
            value={form.email}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          {touched.email && errors.email && (
            <div className="text-xs text-red-500">{errors.email}</div>
          )}
        </Field>

        <Field label="Telefon">
          <input
            className={`${inputCls} ${
              touched.phone && errors.phone ? errorCls : ""
            }`}
            value={form.phone}
            placeholder="+994501234567"
            onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
          {touched.phone && errors.phone && (
            <div className="text-xs text-red-500">{errors.phone}</div>
          )}
        </Field>

        <Field label="Şöbə">
          <select
            className={`${inputCls} ${
              touched.departmentId && errors.departmentId ? errorCls : ""
            }`}
            value={form.departmentId}
            onBlur={() => setTouched((p) => ({ ...p, departmentId: true }))}
            onChange={(e) =>
              setForm((p) => ({ ...p, departmentId: e.target.value }))
            }
          >
            <option value="">— seç —</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>
          {touched.departmentId && errors.departmentId && (
            <div className="text-xs text-red-500">{errors.departmentId}</div>
          )}
        </Field>

        <Field label="Filial">
          <select
            className={inputCls}
            value={form.storeId}
            onChange={(e) =>
              setForm((p) => ({ ...p, storeId: e.target.value }))
            }
          >
            <option value="">— yoxdur —</option>
            {stores.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Vəzifə">
          <select
            className={`${inputCls} ${
              touched.roleId && errors.roleId ? errorCls : ""
            }`}
            value={form.roleId}
            onBlur={() => setTouched((p) => ({ ...p, roleId: true }))}
            onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
          >
            <option value="">— seç —</option>
            {roles.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
          {touched.roleId && errors.roleId && (
            <div className="text-xs text-red-500">{errors.roleId}</div>
          )}
        </Field>

        <Field label="İşə qəbul tarixi">
          <input
            type="date"
            className={`${inputCls} ${
              touched.hireDate && errors.hireDate ? errorCls : ""
            }`}
            value={form.hireDate}
            onBlur={() => setTouched((p) => ({ ...p, hireDate: true }))}
            onChange={(e) =>
              setForm((p) => ({ ...p, hireDate: e.target.value }))
            }
          />
          {touched.hireDate && errors.hireDate && (
            <div className="text-xs text-red-500">{errors.hireDate}</div>
          )}
        </Field>

        <Field label="Əmək haqqı (base)">
          <input
            type="number"
            className={`${inputCls} ${
              touched.salaryBase && errors.salaryBase ? errorCls : ""
            }`}
            value={form.salaryBase}
            onBlur={() => setTouched((p) => ({ ...p, salaryBase: true }))}
            onChange={(e) =>
              setForm((p) => ({ ...p, salaryBase: e.target.value }))
            }
          />
          {touched.salaryBase && errors.salaryBase && (
            <div className="text-xs text-red-500">{errors.salaryBase}</div>
          )}
        </Field>

        <div className="flex justify-between pt-2">
          {showDelete ? (
            <button
              onClick={onDelete}
              disabled={saving}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
            >
              Sil
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border px-3 py-2 disabled:opacity-50"
            >
              Ləğv et
            </button>

            <button
              onClick={handleSubmitClick}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
              title={
                hasErrors ? "Zəhmət olmasa xətaları düzəldin" : "Yadda saxla"
              }
            >
              {saving ? "Yadda saxlanır…" : "Yadda saxla"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
