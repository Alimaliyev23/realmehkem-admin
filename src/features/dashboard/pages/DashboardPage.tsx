import type { ReactNode } from "react";
import { useMemo } from "react";
import { DashboardCharts } from "../components/DashboardCharts";
import { useDashboardData } from "../hooks/useDashboardData";
import { actionLabels, formatAuditMeta } from "../../audit/auditFormatters";

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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {title}
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </div>
      ) : null}
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
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200"
      : tone === "yellow"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200"
        : tone === "red"
          ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"
          : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200";

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

function actionTone(action: string) {
  const a = (action ?? "").toLowerCase();
  if (a.endsWith(".create") || a === "create" || a === "added") return "green";
  if (a.endsWith(".update") || a === "update" || a === "edited")
    return "yellow";
  if (a.endsWith(".delete") || a === "delete" || a === "removed") return "red";
  return "gray";
}

export default function DashboardPage() {
  const { loading, kpis, charts, lists, employeeNameById, ui } =
    useDashboardData();

  const lastUpdated = useMemo(() => new Date().toLocaleString(), []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
        Yüklənir…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Ümumi statistika və son yeniliklər.
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Son yenilənmə: {lastUpdated}
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ümumi əməkdaş" value={kpis.total} />
        <StatCard title="Aktiv" value={kpis.active} />
        <StatCard title="Xitam (terminated)" value={kpis.terminated} />
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

      {/* Lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Announcements */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Elanlar
          </div>
          {lists.recentAnnouncements.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Elan yoxdur.
            </div>
          ) : (
            <div className="space-y-3">
              {lists.recentAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-gray-200 p-3 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {a.title}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {a.body}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
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

        {/* Attendance */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Son davamiyyət
          </div>
          {lists.recentAttendance.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Davamiyyət datası yoxdur.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {lists.recentAttendance.map((x) => (
                <div
                  key={x.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                      {employeeNameById(x.employeeId)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Son əlavə olunan əməkdaşlar
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/10">
          {lists.latestEmployees.map((e) => (
            <div
              key={String(e.id)}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                  {e.fullName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {ui.departmentName(e.departmentId)} •{" "}
                  {ui.storeName(e.storeId)}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {e.hireDate}
                </div>
                <Badge tone={statusTone(e.status)}>{e.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Son əməliyyatlar (audit)
        </div>

        {lists.recentLogs.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Log yoxdur.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {lists.recentLogs.map((l) => {
              const rawAction = String(l.action ?? "");
              const label = actionLabels[rawAction] ?? rawAction ?? "Əməliyyat";
              const tone = actionTone(rawAction);

              const name =
                (l.meta as any)?.fullName ||
                (l.entity?.toLowerCase() === "employees"
                  ? employeeNameById(Number(l.entityId))
                  : "");

              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                        {name ? name : `${l.entity} #${l.entityId}`}
                      </div>
                      <Badge tone={tone as any}>{label}</Badge>
                    </div>

                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {formatAuditMeta(l.meta as any)}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
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
