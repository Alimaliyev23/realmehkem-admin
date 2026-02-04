// src/features/leave/pages/LeaveRequestsPage.tsx

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { DataTable, type ColumnDef } from "../../../components/ui/DataTable";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { Button } from "../../../components/ui/Button";

import type { EmployeeApi } from "../../employees/types";
import type {
  LeaveRequestApi,
  LeaveRequestRow,
  LeaveStatus,
  LeaveType,
} from "../types";
import { LeaveFormModal, LeaveViewModal } from "../LeaveModals";
import { toApiPayload, toFormState, type LeaveFormState } from "../leaveForm";
import { useAuth } from "../../auth/AuthContext";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../lib/api";

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
  } catch {}
}

const typeLabel: Record<LeaveType, string> = {
  annual: "İllik",
  sick: "Xəstəlik",
  unpaid: "Ödənişsiz",
  business: "Ezamiyyət",
  other: "Digər",
};

const statusBadge = (s: LeaveStatus) => {
  const base = "inline-flex rounded px-2 py-1 text-xs";
  if (s === "approved") return `${base} bg-green-100 text-green-700`;
  if (s === "rejected") return `${base} bg-red-100 text-red-700`;
  return `${base} bg-yellow-100 text-yellow-700`;
};

function canApprove(role?: string) {
  return role === "admin" || role === "hr";
}

export default function LeaveRequestsPage() {
  const { user, permissions } = useAuth();

  const [employees, setEmployees] = useState<EmployeeApi[]>([]);
  const [items, setItems] = useState<LeaveRequestApi[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [active, setActive] = useState<LeaveRequestApi | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<LeaveFormState>(() => toFormState());
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const isApprover = canApprove(user?.role);

  async function refresh() {
    const [emps, leaves] = await Promise.all([
      apiGet<EmployeeApi[]>("/employees"),
      apiGet<LeaveRequestApi[]>("/leaveRequests"),
    ]);
    setEmployees(emps);
    setItems(leaves);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await refresh();
      } catch (err) {
        console.error(err);
        toast.error("Məzuniyyət məlumatları yüklənmədi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows: LeaveRequestRow[] = useMemo(() => {
    const empMap = new Map(employees.map((e) => [String(e.id), e]));
    const limitStore = permissions.limitToStoreId;

    const mapped = items.map((x) => {
      const emp = empMap.get(String(x.employeeId));
      const storeId = emp?.storeId ?? null;
      return {
        id: x.id,
        employeeId: x.employeeId,
        employeeName: emp?.fullName ?? `#${x.employeeId}`,
        storeId,
        storeName: storeId ? `Store #${storeId}` : "—",
        type: x.type,
        startDate: x.startDate,
        endDate: x.endDate,
        days: x.days,
        status: x.status,
        note: x.note,
      } as LeaveRequestRow;
    });

    if (!limitStore) return mapped;
    return mapped.filter((r) => String(r.storeId ?? "") === limitStore);
  }, [items, employees, permissions.limitToStoreId]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.status))).sort((a, b) =>
      String(a).localeCompare(String(b), "az"),
    );
  }, [rows]);

  const typeOptions = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.type))).sort((a, b) =>
      String(a).localeCompare(String(b), "az"),
    );
  }, [rows]);

  async function openView(id: string) {
    try {
      setViewOpen(true);
      setActive(null);
      setActive(await apiGet<LeaveRequestApi>(`/leaveRequests/${id}`));
    } catch (err) {
      console.error(err);
      toast.error("Məlumat açılmadı.");
      setViewOpen(false);
      setActive(null);
    }
  }

  async function openCreate() {
    setForm(toFormState());
    setEditId(null);
    setActive(null);
    setFormOpen(true);
  }

  async function openEdit(id: string) {
    try {
      const it = await apiGet<LeaveRequestApi>(`/leaveRequests/${id}`);

      if (!isApprover) {
        toast.warning("Yalnız HR/Admin redaktə edə bilər.");
        return;
      }

      setActive(it);
      setEditId(id);
      setForm(toFormState(it));
      setFormOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Redaktə açılmadı.");
    }
  }

  function askDelete(id: string) {
    if (!isApprover) {
      toast.warning("Yalnız HR/Admin silə bilər.");
      return;
    }
    setEditId(id);
    setConfirmOpen(true);
  }

  async function submit() {
    if (!user) return;
    console.log("FORM", form);
    const payload = toApiPayload({
      ...form,
      status: isApprover ? form.status : "pending",
    });
    console.log("PAYLOAD", payload);

    setSaving(true);
    try {
      if (editId) {
        await apiPut(`/leaveRequests/${editId}`, { ...payload, id: editId });
        toast.success("Yeniləndi");

        await writeAudit({
          actorId: user.id,
          action: "leave.update",
          entity: "leaveRequests",
          entityId: String(editId),
          meta: { employeeId: payload.employeeId, status: payload.status },
        });
      } else {
        const newId = String(Date.now());
        await apiPost(`/leaveRequests`, { ...payload, id: newId });
        toast.success("Yaradıldı");

        await writeAudit({
          actorId: user.id,
          action: "leave.create",
          entity: "leaveRequests",
          entityId: newId,
          meta: { employeeId: payload.employeeId, status: payload.status },
        });
      }

      await refresh();
      setFormOpen(false);
      setActive(null);
      setEditId(null);
    } catch (err) {
      console.error(err);
      toast.error("Yadda saxlanmadı.");
    } finally {
      setSaving(false);
    }
  }

  async function removeConfirmed() {
    if (!user || !editId) return;

    setSaving(true);
    try {
      await apiDelete(`/leaveRequests/${editId}`);
      toast.success("Silindi");

      await writeAudit({
        actorId: user.id,
        action: "leave.delete",
        entity: "leaveRequests",
        entityId: String(editId),
      });

      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Silinmədi.");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
      setEditId(null);
    }
  }

  async function quickApprove(id: string, status: LeaveStatus) {
    if (!user || !isApprover) return;

    try {
      const it = await apiGet<LeaveRequestApi>(`/leaveRequests/${id}`);
      await apiPut(`/leaveRequests/${id}`, { ...it, status });

      await writeAudit({
        actorId: user.id,
        action: "leave.status",
        entity: "leaveRequests",
        entityId: String(id),
        meta: { status },
      });

      toast.success(status === "approved" ? "Təsdiqləndi" : "Rədd edildi");
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Status dəyişmədi.");
    }
  }

  const columns: ColumnDef<LeaveRequestRow>[] = useMemo(
    () => [
      { key: "employeeName", header: "Əməkdaş" },
      {
        key: "type",
        header: "Tip",
        enableColumnFilter: true,
        filterVariant: "select",
        filterOptions: typeOptions.map((t) => typeLabel[t as LeaveType]),
        cell: (r) => typeLabel[r.type],
      },
      { key: "startDate", header: "Başlanğıc", enableSorting: true },
      { key: "endDate", header: "Bitmə", enableSorting: true },
      {
        key: "days",
        header: "Gün",
        enableSorting: true,
        sortValue: (r) => r.days,
      },
      {
        key: "status",
        header: "Status",
        enableColumnFilter: true,
        filterVariant: "select",
        filterOptions: statusOptions.map((s) =>
          s === "pending"
            ? "Gözləmədə"
            : s === "approved"
              ? "Təsdiqlənib"
              : "Rədd edilib",
        ),
        cell: (r) => (
          <span className={statusBadge(r.status)}>
            {r.status === "pending"
              ? "Gözləmədə"
              : r.status === "approved"
                ? "Təsdiqlənib"
                : "Rədd edilib"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-[260px]",
        cell: (r) => (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openView(r.id)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Bax
            </button>

            {isApprover && (
              <button
                onClick={() => openEdit(r.id)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Redaktə
              </button>
            )}

            {isApprover && r.status === "pending" && (
              <>
                <button
                  onClick={() => quickApprove(r.id, "approved")}
                  className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Təsdiq
                </button>
                <button
                  onClick={() => quickApprove(r.id, "rejected")}
                  className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Rədd
                </button>
              </>
            )}

            {isApprover && (
              <button
                onClick={() => askDelete(r.id)}
                className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
              >
                Sil
              </button>
            )}
          </div>
        ),
      },
    ],
    [isApprover, statusOptions, typeOptions],
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Məzuniyyət / İcazələr</h1>
          <div className="text-sm text-gray-500">
            HR/Admin təsdiqləyir, digər rollar request yarada bilər.
          </div>
        </div>

        <Button onClick={openCreate}>Yeni sorğu</Button>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        getRowKey={(r) => String(r.id)}
        isLoading={loading}
        emptyText="Sorğu yoxdur"
        globalSearchKeys={["employeeName"] as any}
      />

      <LeaveViewModal
        open={viewOpen}
        item={active}
        employees={employees}
        onClose={() => {
          setViewOpen(false);
          setActive(null);
        }}
      />

      <LeaveFormModal
        open={formOpen}
        title={editId ? "Sorğunu yenilə" : "Yeni sorğu"}
        employees={employees}
        form={form}
        setForm={setForm}
        saving={saving}
        canSetStatus={isApprover}
        showDelete={!!editId && isApprover}
        onClose={() => {
          setFormOpen(false);
          setActive(null);
          setEditId(null);
        }}
        onSubmit={submit}
        onDelete={() => {
          if (!editId) return;
          setConfirmOpen(true);
        }}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Silmək istəyirsiniz?"
        description="Bu sorğu silinəcək."
        confirmText="Sil"
        cancelText="Ləğv et"
        loading={saving}
        onClose={() => setConfirmOpen(false)}
        onConfirm={removeConfirmed}
      />
    </div>
  );
}
