// src/features/employees/hooks/useEmployeeActions.ts
import { useState } from "react";
import { toast } from "react-toastify";

import type { EmployeeApi } from "../types";
import type { EmployeeFormState } from "../employeeForm";
import { toApiPayload, toFormState } from "../employeeForm";

import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/api";
import { exportToExcel } from "../../../lib/exportExcel";

import {
  canCreateEmployee,
  canEditEmployee,
  canDeleteEmployee,
  guardMessage,
} from "../../auth/guards";

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
    await apiPost("/auditLogs", { ...body, at: nowIso() });
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

  const dt = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return false;

  return (
    dt.getFullYear() === y && dt.getMonth() + 1 === m && dt.getDate() === d
  );
}

type Args = {
  userId: number | null;
  role?: string | null;
  permissions: any;

  departments: Array<{ id: any; name: string }>;
  stores: Array<{ id: any; name: string }>;
  roles: Array<{ id: any; name: string }>;

  refresh: () => Promise<void>;

  form: EmployeeFormState;
  setForm: (v: EmployeeFormState) => void;

  setFormOpen: (v: boolean) => void;
  setViewOpen: (v: boolean) => void;
};

export function useEmployeeActions(args: Args) {
  const {
    userId,
    role,
    permissions,
    departments,
    stores,
    roles,
    refresh,
    form,
    setForm,
    setFormOpen,
    setViewOpen,
  } = args;

  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [activeEmployee, setActiveEmployee] = useState<EmployeeApi | null>(
    null,
  );

  async function openView(id: number) {
    try {
      setViewOpen(true);
      setActiveEmployee(null);
      setActiveEmployee(await apiGet<EmployeeApi>(`/employees/${id}`));
    } catch {
      toast.error("Əməkdaş məlumatı açılmadı.");
      setViewOpen(false);
    }
  }

  async function openEdit(id: number) {
    const emp = await apiGet<EmployeeApi>(`/employees/${id}`);

    const chk = canEditEmployee(emp, permissions);
    if (!chk.ok) {
      toast.warning(guardMessage(chk.reason));
      return;
    }

    setFormOpen(true);
    setEditId(id);
    setActiveEmployee(emp);
    setForm(toFormState(emp));
  }

  function openCreate() {
    if (!canCreateEmployee(permissions)) {
      toast.warning("Yeni əməkdaş əlavə etməyə icazən yoxdur.");
      return;
    }
    setFormOpen(true);
    setEditId(null);
    setActiveEmployee(null);
    setForm(toFormState());
  }

  async function submit() {
    if (editId == null && !canCreateEmployee(permissions)) {
      toast.warning("Yeni əməkdaş əlavə etməyə icazən yoxdur.");
      return;
    }

    const name = form.fullName.trim();
    const email = form.email.trim();

    if (!isValidFullName(name)) {
      toast.warning("Ad Soyad düzgün deyil.");
      return;
    }
    if (!isValidGmail(email)) {
      toast.warning("Email yalnız Gmail formatında olmalıdır.");
      return;
    }
    if (!form.hireDate || !isValidISODate(form.hireDate)) {
      toast.warning("Tarix düzgün deyil.");
      return;
    }

    setSaving(true);
    try {
      if (editId != null && activeEmployee) {
        const payload = toApiPayload(form, activeEmployee);
        await apiPut(`/employees/${editId}`, payload);

        await writeAudit({
          actorId: userId ?? 0,
          action: "employee.update",
          entity: "employees",
          entityId: String(editId),
          meta: { fullName: payload.fullName },
        });

        toast.success("Əməkdaş yeniləndi");
      } else {
        const payload = toApiPayload(form);
        const created = await apiPost<unknown, EmployeeApi>(
          `/employees`,
          payload,
        );

        await writeAudit({
          actorId: userId ?? 0,
          action: "employee.create",
          entity: "employees",
          entityId: String(created.id),
          meta: { fullName: created.fullName },
        });

        toast.success("Yeni əməkdaş yaradıldı");
      }

      await refresh();
      setFormOpen(false);
      setEditId(null);
      setActiveEmployee(null);
    } catch {
      toast.error("Server xətası oldu.");
    } finally {
      setSaving(false);
    }
  }

  function askRemove() {
    if (!activeEmployee) return;

    const chk = canDeleteEmployee(activeEmployee, permissions);
    if (!chk.ok) {
      toast.warning(guardMessage(chk.reason));
      return;
    }
    setConfirmOpen(true);
  }

  async function confirmRemove() {
    if (!activeEmployee) return;

    setSaving(true);
    try {
      await apiDelete(`/employees/${activeEmployee.id}`);

      await writeAudit({
        actorId: userId ?? 0,
        action: "employee.delete",
        entity: "employees",
        entityId: String(activeEmployee.id),
        meta: { fullName: activeEmployee.fullName },
      });

      await refresh();
      toast.success("Əməkdaş silindi");

      setConfirmOpen(false);
      setFormOpen(false);
      setEditId(null);
      setActiveEmployee(null);
    } finally {
      setSaving(false);
    }
  }

  const canExport = role === "admin" || role === "hr";

  async function exportExcel() {
    if (!canExport) return;

    const all = await apiGet<EmployeeApi[]>("/employees");

    const limit = permissions.limitToStoreId;
    const data = limit
      ? all.filter((e) => String(e.storeId ?? "") === String(limit))
      : all;

    const storeMap = new Map(stores.map((s) => [String(s.id), s.name]));
    const deptMap = new Map(departments.map((d) => [String(d.id), d.name]));
    const roleMap = new Map(roles.map((r) => [String(r.id), r.name]));

    exportToExcel(data, "employees", "Əməkdaşlar", [
      { header: "Ad Soyad", value: (e) => e.fullName, width: 24 },
      { header: "Email", value: (e) => e.email ?? "", width: 24 },
      {
        header: "Filial",
        value: (e) => storeMap.get(String(e.storeId)) ?? "—",
        width: 18,
      },
      {
        header: "Şöbə",
        value: (e) => deptMap.get(String(e.departmentId)) ?? "—",
        width: 18,
      },
      {
        header: "Vəzifə",
        value: (e) => roleMap.get(String(e.roleId)) ?? "—",
        width: 18,
      },
    ]);

    toast.success("Excel export hazırdır");
  }

  return {
    saving,
    confirmOpen,
    editId,
    activeEmployee,
    setConfirmOpen,
    setEditId,
    setActiveEmployee,
    openView,
    openEdit,
    openCreate,
    submit,
    askRemove,
    confirmRemove,
    exportExcel,
    canExport,
  };
}
