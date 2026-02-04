import type { LeaveRequestApi, LeaveStatus, LeaveType } from "./types";

export type LeaveFormState = {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  note: string;
  status: LeaveStatus;
};

export function toFormState(x?: LeaveRequestApi): LeaveFormState {
  return {
    employeeId: x ? String(x.employeeId) : "",
    type: x?.type ?? "annual",
    startDate: x?.startDate ?? "",
    endDate: x?.endDate ?? "",
    note: x?.note ?? "",
    status: x?.status ?? "pending",
  };
}

export function calcDaysInclusive(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const s = new Date(`${startDate}T00:00:00`);
  const e = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

export function toApiPayload(form: LeaveFormState) {
  return {
    employeeId: Number(form.employeeId),
    type: form.type,
    startDate: form.startDate,
    endDate: form.endDate,
    days: calcDaysInclusive(form.startDate, form.endDate),
    status: form.status,
    note: form.note?.trim() || "",
  };
}
