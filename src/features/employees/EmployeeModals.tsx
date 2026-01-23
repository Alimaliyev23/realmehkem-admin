import type {
  DepartmentApi,
  StoreApi,
  RoleApi,
  EmployeeApi,
  EmployeeStatus,
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

  // ✅ FIX: id-lər bəzən string/number olur
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
              <div className="mt-1 text-gray-900 dark:text-slate-100">
                {employee.email}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Telefon
              </div>
              <div className="mt-1 text-gray-900 dark:text-slate-100">
                {employee.phone}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Şöbə
              </div>
              <div className="mt-1 text-gray-900 dark:text-slate-100">
                {depNameById(employee.departmentId)}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Filial
              </div>
              <div className="mt-1 text-gray-900 dark:text-slate-100">
                {storeNameById(employee.storeId)}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Vəzifə
              </div>
              <div className="mt-1 text-gray-900 dark:text-slate-100">
                {roleNameById(employee.roleId)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onEdit(employee.id)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
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

  const inputCls =
    "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 " +
    "dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-white/10";

  const selectCls =
    "h-10 rounded-lg border px-3 text-sm " +
    "bg-white text-gray-900 border-gray-200 " +
    "dark:bg-slate-800 dark:text-slate-100 dark:border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Ad Soyad">
            <input
              className={inputCls}
              value={form.fullName}
              onChange={(e) =>
                setForm((p) => ({ ...p, fullName: e.target.value }))
              }
            />
          </Field>

          <Field label="Status">
            <select
              className={selectCls}
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as EmployeeStatus,
                }))
              }
            >
              <option value="active">active</option>
              <option value="on_leave">on_leave</option>
              <option value="terminated">terminated</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Email">
            <input
              className={inputCls}
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>

          <Field label="Telefon">
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Şöbə">
            <select
              className={selectCls}
              value={form.departmentId}
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
          </Field>

          <Field label="Filial">
            <select
              className={selectCls}
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
              className={selectCls}
              value={form.roleId}
              onChange={(e) =>
                setForm((p) => ({ ...p, roleId: e.target.value }))
              }
            >
              <option value="">— seç —</option>
              {roles.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Menecer (employeeId)">
            <input
              className={inputCls}
              placeholder="boş = yoxdur"
              value={form.managerId}
              onChange={(e) =>
                setForm((p) => ({ ...p, managerId: e.target.value }))
              }
            />
          </Field>

          <Field label="İşə qəbul tarixi">
            <input
              type="date"
              className={inputCls}
              value={form.hireDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, hireDate: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Əmək haqqı (base)">
            <input
              type="number"
              className={inputCls}
              value={form.salaryBase}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryBase: e.target.value }))
              }
            />
          </Field>

          <Field label="Valyuta">
            <input
              className={inputCls}
              value={form.salaryCurrency}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryCurrency: e.target.value }))
              }
            />
          </Field>

          <Field label="Bonus">
            <input
              type="number"
              className={inputCls}
              value={form.salaryBonus}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryBonus: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2">
          {showDelete ? (
            <button
              onClick={onDelete}
              disabled={saving}
              className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:bg-white/5 dark:text-red-300 dark:hover:bg-red-500/10"
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
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              Ləğv et
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
            >
              {saving ? "Yadda saxlanır…" : "Yadda saxla"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
