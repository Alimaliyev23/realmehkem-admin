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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-sm hover:bg-gray-100"
          >
            Bağla
          </button>
        </div>
        <div className="p-4">{children}</div>
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
      <span className="text-xs text-gray-600">{label}</span>
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
    departments.find((d) => d.id === id)?.name ?? "—";
  const storeNameById = (id: number | null) =>
    id == null ? "—" : (stores.find((s) => s.id === id)?.name ?? "—");
  const roleNameById = (id: number) =>
    roles.find((r) => r.id === id)?.name ?? "—";

  return (
    <Modal title="Əməkdaş məlumatı" onClose={onClose}>
      {!employee ? (
        <div className="text-sm text-gray-600">Yüklənir…</div>
      ) : (
        <div className="grid gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">Ad Soyad</div>
            <div className="font-medium">{employee.fullName}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div>{employee.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Telefon</div>
              <div>{employee.phone}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500">Şöbə</div>
              <div>{depNameById(employee.departmentId)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Filial</div>
              <div>{storeNameById(employee.storeId)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Vəzifə</div>
              <div>{roleNameById(employee.roleId)}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onEdit(employee.id)}
              className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
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

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad Soyad">
            <input
              className="h-10 rounded border px-3 text-sm"
              value={form.fullName}
              onChange={(e) =>
                setForm((p) => ({ ...p, fullName: e.target.value }))
              }
            />
          </Field>

          <Field label="Status">
            <select
              className="h-10 rounded border px-3 text-sm"
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <input
              className="h-10 rounded border px-3 text-sm"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>

          <Field label="Telefon">
            <input
              className="h-10 rounded border px-3 text-sm"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Şöbə">
            <select
              className="h-10 rounded border px-3 text-sm"
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
              className="h-10 rounded border px-3 text-sm"
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
              className="h-10 rounded border px-3 text-sm"
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Menecer (employeeId)">
            <input
              className="h-10 rounded border px-3 text-sm"
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
              className="h-10 rounded border px-3 text-sm"
              value={form.hireDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, hireDate: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Əmək haqqı (base)">
            <input
              type="number"
              className="h-10 rounded border px-3 text-sm"
              value={form.salaryBase}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryBase: e.target.value }))
              }
            />
          </Field>

          <Field label="Valyuta">
            <input
              className="h-10 rounded border px-3 text-sm"
              value={form.salaryCurrency}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryCurrency: e.target.value }))
              }
            />
          </Field>

          <Field label="Bonus">
            <input
              type="number"
              className="h-10 rounded border px-3 text-sm"
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
              className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
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
              className="rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Ləğv et
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              className="rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Yadda saxlanır…" : "Yadda saxla"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
