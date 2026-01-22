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
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
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
    <span className={`inline-flex rounded px-2 py-1 text-xs ${cls}`}>
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

  if (loading) return <div className="text-sm text-gray-600">Yüklənir…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Ümumi statistika və son yeniliklər.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ümumi əməkdaş" value={kpis.total} />
        <StatCard title="Aktiv" value={kpis.active} />
        <StatCard title="Məzun (terminated)" value={kpis.terminated} />
        <StatCard title="Məzuniyyətdə (on_leave)" value={kpis.onLeave} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Məzuniyyət sorğuları"
          value={kpis.pendingLeaves}
          hint="pending"
        />
        <StatCard title="Payroll draft" value={kpis.payrollDraft} />
        <StatCard title="Payroll paid" value={kpis.payrollPaid} />
        <StatCard title="Audit log" value={kpis.auditCount} />
      </div>

      <DashboardCharts
        storeData={charts.storeChartData}
        departmentData={charts.departmentChartData}
        hiresByMonth={charts.hiresByMonth}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Elanlar */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Elanlar</div>
          {lists.recentAnnouncements.length === 0 ? (
            <div className="text-sm text-gray-600">Elan yoxdur.</div>
          ) : (
            <div className="space-y-3">
              {lists.recentAnnouncements.map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{a.title}</div>
                    <Badge tone={a.priority === "high" ? "red" : "gray"}>
                      {a.priority}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">{a.body}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {formatDate(a.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Davamiyyət */}
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
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <div className="font-medium">
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

      {/* Son əlavə olunanlar */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold">
          Son əlavə olunan əməkdaşlar
        </div>
        <div className="divide-y">
          {lists.latestEmployees.map((e) => (
            <div
              key={String(e.id)}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div>
                <div className="font-medium">{e.fullName}</div>
                <div className="text-xs text-gray-500">
                  {ui.departmentName(e.departmentId)} •{" "}
                  {ui.storeName(e.storeId)}
                </div>
              </div>
              <div className="text-right">
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
            {lists.recentLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <div className="font-medium">{l.action}</div>
                  <div className="text-xs text-gray-500">
                    {l.entity}:{l.entityId}
                    {l.meta?.fullName ? ` • ${l.meta.fullName}` : ""}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{formatDate(l.at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
