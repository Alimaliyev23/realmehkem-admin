import type { ReactNode } from "react";
import { DashboardCharts } from "../components/DashboardCharts";
import { useDashboardData } from "../hooks/useDashboardData";

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "green" | "yellow" | "red";
}) {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700"
      : tone === "yellow"
        ? "bg-yellow-100 text-yellow-700"
        : tone === "red"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex rounded-lg px-2 py-1 text-xs ${cls}`}>
      {children}
    </span>
  );
}

function statusTone(s: string) {
  if (s === "active") return "green";
  if (s === "on_leave") return "yellow";
  return "red";
}

function formatDate(iso: string) {
  return iso?.slice(0, 10) ?? "";
}

export default function DashboardPage() {
  const { loading, kpis, charts, lists, employeeNameById, ui } =
    useDashboardData();

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-gray-600 shadow-sm">
        Yüklənir…
      </div>
    );
  }

  const lastUpdated = new Date().toLocaleString();

  return (
    <div className="space-y-6">
      {/* Top */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Ümumi statistika və son yeniliklər.
          </p>
        </div>
        <div className="text-xs text-gray-500">Last updated: {lastUpdated}</div>
      </div>

      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ümumi əməkdaş" value={kpis.total} />
        <StatCard title="Aktiv" value={kpis.active} />
        <StatCard title="Məzun (terminated)" value={kpis.terminated} />
        <StatCard title="Məzuniyyətdə (on_leave)" value={kpis.onLeave} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Məzuniyyət sorğuları"
          value={kpis.pendingLeaves}
          hint="pending"
        />
        <StatCard title="Payroll draft" value={kpis.payrollDraft} />
        <StatCard title="Payroll paid" value={kpis.payrollPaid} />
        <StatCard title="Audit log" value={kpis.auditCount} />
      </div>

      {/* Charts */}
      <DashboardCharts
        storeData={charts.storeChartData}
        departmentData={charts.departmentChartData}
        hiresByMonth={charts.hiresByMonth}
      />

      {/* Announcements + Attendance */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Elanlar</div>
          {lists.recentAnnouncements.length === 0 ? (
            <div className="text-sm text-gray-600">Elan yoxdur.</div>
          ) : (
            <div className="space-y-3">
              {lists.recentAnnouncements.map((a) => (
                <div key={a.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-900">{a.title}</div>
                      <div className="mt-1 text-sm text-gray-600">{a.body}</div>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDate(a.createdAt)}
                      </div>
                    </div>
                    <Badge tone={a.priority === "high" ? "red" : "gray"}>
                      {a.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Son davamiyyət</div>
          {lists.recentAttendance.length === 0 ? (
            <div className="text-sm text-gray-600">
              Davamiyyət datası yoxdur.
            </div>
          ) : (
            <div className="divide-y">
              {lists.recentAttendance.map((x) => (
                <div
                  key={x.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900">
                      {employeeNameById(x.employeeId)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {x.date} • {x.checkIn ?? "—"}–{x.checkOut ?? "—"}
                    </div>
                  </div>
                  <Badge
                    tone={
                      x.status === "present"
                        ? "green"
                        : x.status === "late"
                          ? "yellow"
                          : "red"
                    }
                  >
                    {x.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest employees */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">
          Son əlavə olunan əməkdaşlar
        </div>
        <div className="divide-y">
          {lists.latestEmployees.map((e) => (
            <div
              key={String(e.id)}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-gray-900">
                  {e.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {ui.departmentName(e.departmentId)} •{" "}
                  {ui.storeName(e.storeId)}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs text-gray-500">{e.hireDate}</div>
                <Badge tone={statusTone(e.status)}>{e.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">
          Son əməliyyatlar (audit)
        </div>

        {lists.recentLogs.length === 0 ? (
          <div className="text-sm text-gray-600">Log yoxdur.</div>
        ) : (
          <div className="divide-y">
            {lists.recentLogs.map((l) => {
              const action = String(l.action ?? "").toLowerCase();

              // ✅ action-a görə oxunaqlı mətn
              const actionLabel =
                action === "create" || action === "added"
                  ? "Əlavə edildi"
                  : action === "update" || action === "edited"
                    ? "Yeniləndi"
                    : action === "delete" || action === "removed"
                      ? "Silindi"
                      : String(l.action ?? "Əməliyyat");

              // ✅ entity adı (istəsən genişləndirə bilərsən)
              const entityLabel =
                String(l.entity ?? "").toLowerCase() === "employees"
                  ? "Əməkdaş"
                  : String(l.entity ?? "Məlumat");

              // ✅ adı meta-dan götür, yoxdursa employeeNameById ilə tap
              const name =
                (l.meta as any)?.fullName ||
                (l.entity?.toLowerCase() === "employees"
                  ? employeeNameById(Number(l.entityId))
                  : "");

              // ✅ badge rəngi: səndə olan Badge komponentindən istifadə edirik
              const tone =
                action === "create" || action === "added"
                  ? "green"
                  : action === "update" || action === "edited"
                    ? "yellow"
                    : action === "delete" || action === "removed"
                      ? "red"
                      : "gray";

              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-medium text-gray-900">
                        {entityLabel}: {name ? name : `#${l.entityId}`}
                      </div>
                      <Badge tone={tone as any}>{actionLabel}</Badge>
                    </div>

                    <div className="truncate text-xs text-gray-500">
                      {l.entity}:{l.entityId}
                      {name ? ` • ${name}` : ""}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs text-gray-500">
                    {formatDate(l.at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
