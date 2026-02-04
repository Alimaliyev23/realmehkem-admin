// src/features/leave/LeaveModals.tsx

import React from "react";
import type { EmployeeApi } from "../employees/types";
import type { LeaveRequestApi, LeaveType, LeaveStatus } from "./types";
import type { LeaveFormState } from "./leaveForm";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";
import { calcDaysInclusive } from "./leaveForm";

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

const typeLabel: Record<LeaveType, string> = {
  annual: "İllik məzuniyyət",
  sick: "Xəstəlik vərəqəsi",
  unpaid: "Ödənişsiz icazə",
  business: "Ezamiyyət / iş icazəsi",
  other: "Digər",
};

const statusLabel: Record<LeaveStatus, string> = {
  pending: "Gözləmədə",
  approved: "Təsdiqlənib",
  rejected: "Rədd edilib",
};

export function LeaveViewModal({
  open,
  item,
  employees,
  onClose,
}: {
  open: boolean;
  item: LeaveRequestApi | null;
  employees: EmployeeApi[];
  onClose: () => void;
}) {
  if (!open) return null;

  const emp = item
    ? employees.find((e) => String(e.id) === String(item.employeeId))
    : null;

  return (
    <Modal title="Məzuniyyət / İcazə məlumatı" onClose={onClose}>
      {!item ? (
        <Loader />
      ) : (
        <div className="grid gap-3 text-sm">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Əməkdaş
            </div>
            <div className="mt-1 font-medium">
              {emp?.fullName ?? `#${item.employeeId}`}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Tip</div>
              <div className="mt-1">{typeLabel[item.type]}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Status</div>
              <div className="mt-1">{statusLabel[item.status]}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Başlanğıc</div>
              <div className="mt-1">{item.startDate}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Bitmə</div>
              <div className="mt-1">{item.endDate}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-gray-500">Gün sayı</div>
              <div className="mt-1">{item.days}</div>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">Qeyd</div>
            <div className="mt-1">{item.note?.trim() ? item.note : "—"}</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function LeaveFormModal({
  open,
  title,
  employees,
  form,
  setForm,
  saving,
  canSetStatus,
  showDelete,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  title: string;
  employees: EmployeeApi[];
  form: LeaveFormState;
  setForm: React.Dispatch<React.SetStateAction<LeaveFormState>>;
  saving: boolean;

  canSetStatus: boolean; 
  showDelete?: boolean;

  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}) {
  if (!open) return null;

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const daysPreview = calcDaysInclusive(form.startDate, form.endDate);

  const errors = {
    employeeId: !form.employeeId ? "Əməkdaş seçilməlidir" : "",
    startDate: !form.startDate ? "Başlanğıc tarix seçilməlidir" : "",
    endDate: !form.endDate ? "Bitmə tarix seçilməlidir" : "",
    dateOrder:
      form.startDate && form.endDate && daysPreview <= 0
        ? "Bitmə tarixi başlanğıcdan əvvəl ola bilməz"
        : "",
  };

  const hasErrors = Object.values(errors).some(Boolean);

  function markAllTouched() {
    setTouched({
      employeeId: true,
      startDate: true,
      endDate: true,
    });
  }

  function handleSubmit() {
    markAllTouched();
    if (hasErrors) return;
    onSubmit();
  }

  const employeeOptions = employees.map((e) => ({
    value: String(e.id),
    label: `${e.fullName} (#${e.id})`,
  }));

  const typeOptions = [
    { value: "annual", label: "İllik məzuniyyət" },
    { value: "sick", label: "Xəstəlik vərəqəsi" },
    { value: "unpaid", label: "Ödənişsiz icazə" },
    { value: "business", label: "Ezamiyyət / iş icazəsi" },
    { value: "other", label: "Digər" },
  ];

  const statusOptions = [
    { value: "pending", label: "Gözləmədə" },
    { value: "approved", label: "Təsdiqlənib" },
    { value: "rejected", label: "Rədd edilib" },
  ];

  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-4">
        <Select
          label="Əməkdaş"
          value={form.employeeId}
          options={[{ value: "", label: "Seçin…" }, ...employeeOptions]}
          onBlur={() => setTouched((p) => ({ ...p, employeeId: true }))}
          onChange={(e) =>
            setForm((p) => ({ ...p, employeeId: e.target.value }))
          }
          error={touched.employeeId ? errors.employeeId : ""}
        />

        <Select
          label="Tip"
          value={form.type}
          options={typeOptions}
          onChange={(v) => setForm((p) => ({ ...p, type: v as any }))}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Başlanğıc tarix"
            type="date"
            value={form.startDate}
            onBlur={() => setTouched((p) => ({ ...p, startDate: true }))}
            onChange={(e) =>
              setForm((p) => ({ ...p, startDate: e.target.value }))
            }
            error={touched.startDate ? errors.startDate : ""}
          />
          <Input
            label="Bitmə tarix"
            type="date"
            value={form.endDate}
            onBlur={() => setTouched((p) => ({ ...p, endDate: true }))}
            onChange={(e) =>
              setForm((p) => ({ ...p, endDate: e.target.value }))
            }
            error={touched.endDate ? errors.endDate : ""}
          />
        </div>

        {touched.endDate && errors.dateOrder ? (
          <div className="text-sm text-red-600">{errors.dateOrder}</div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-slate-300">
            Gün sayı (hesablanır): <b>{daysPreview || "—"}</b>
          </div>
        )}

        {canSetStatus && (
          <Select
            label="Status (HR/Admin)"
            value={form.status}
            options={statusOptions}
            onChange={(v) => setForm((p) => ({ ...p, status: v as any }))}
          />
        )}

        <Input
          label="Qeyd"
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        />

        <div className="flex items-center justify-between gap-2">
          {showDelete ? (
            <Button
              variant="danger"
              disabled={saving}
              onClick={() => onDelete?.()}
            >
              Sil
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Ləğv et
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              Yadda saxla
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
