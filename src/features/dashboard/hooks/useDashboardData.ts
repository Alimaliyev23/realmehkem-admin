import { useEffect, useMemo, useState } from "react";
import type {
  DepartmentApi,
  StoreApi,
  EmployeeApi,
  EmployeeStatus,
} from "../../employees/types";

type LeaveRequest = {
  id: string;
  employeeId: number;
  type: "annual" | "sick" | string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | string;
  note?: string;
};

type PayrollItem = {
  id: string;
  employeeId: number;
  month: string;
  base: number;
  bonus: number;
  deductions: number;
  net: number;
  status: "draft" | "paid" | string;
};

type AttendanceItem = {
  id: string;
  employeeId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "late" | "absent" | string;
  note?: string;
};

type Announcement = {
  id: string;
  companyId: number;
  title: string;
  body: string;
  priority: "high" | "normal" | "low" | string;
  createdAt: string;
};

type AuditLog = {
  id: string;
  actorId: number;
  action: string;
  entity: string;
  entityId: string;
  at: string;
  meta?: Record<string, any>;
};

const API_BASE_URL = "http://127.0.0.1:3001";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function formatMonth(iso: string) {
  return (iso ?? "").slice(0, 7);
}

export type DashboardKpis = {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
  pendingLeaves: number;
  payrollDraft: number;
  payrollPaid: number;
  auditCount: number;
};

export type ChartDatum = { name: string; count: number; fullName?: string };
export type TrendDatum = { month: string; count: number };

export function useDashboardData() {
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState<EmployeeApi[]>([]);
  const [departments, setDepartments] = useState<DepartmentApi[]>([]);
  const [stores, setStores] = useState<StoreApi[]>([]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [emp, dep, st, leaves, payrollItems, att, anns, logs] =
          await Promise.all([
            apiGet<EmployeeApi[]>("/employees"),
            apiGet<DepartmentApi[]>("/departments"),
            apiGet<StoreApi[]>("/stores"),
            apiGet<LeaveRequest[]>("/leaveRequests").catch(() => []),
            apiGet<PayrollItem[]>("/payroll").catch(() => []),
            apiGet<AttendanceItem[]>("/attendance").catch(() => []),
            apiGet<Announcement[]>("/announcements").catch(() => []),
            apiGet<AuditLog[]>("/auditLogs").catch(() => []),
          ]);

        if (!cancelled) {
          setEmployees(emp);
          setDepartments(dep);
          setStores(st);
          setLeaveRequests(leaves);
          setPayroll(payrollItems);
          setAttendance(att);
          setAnnouncements(anns);
          setAuditLogs(logs);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  const depMap = useMemo(
    () => new Map(departments.map((d: any) => [String(d.id), d.name])),
    [departments],
  );
  const storeMap = useMemo(
    () => new Map(stores.map((s: any) => [String(s.id), s.name])),
    [stores],
  );

  const kpis: DashboardKpis = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "active").length;
    const onLeave = employees.filter((e) => e.status === "on_leave").length;
    const terminated = employees.filter(
      (e) => e.status === "terminated",
    ).length;

    const pendingLeaves = leaveRequests.filter(
      (x) => x.status === "pending",
    ).length;
    const payrollDraft = payroll.filter((x) => x.status === "draft").length;
    const payrollPaid = payroll.filter((x) => x.status === "paid").length;

    return {
      total,
      active,
      onLeave,
      terminated,
      pendingLeaves,
      payrollDraft,
      payrollPaid,
      auditCount: auditLogs.length,
    };
  }, [employees, leaveRequests, payroll, auditLogs.length]);

  const storeChartData: ChartDatum[] = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) {
      const fullName =
        e.storeId == null
          ? "Filial yoxdur"
          : (storeMap.get(String(e.storeId)) ?? "—");
      m.set(fullName, (m.get(fullName) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, fullName: name }));
  }, [employees, storeMap]);

  const departmentChartData: ChartDatum[] = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) {
      const fullName = depMap.get(String(e.departmentId)) ?? "—";
      m.set(fullName, (m.get(fullName) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, fullName: name }));
  }, [employees, depMap]);

  const hiresByMonth: TrendDatum[] = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) {
      const month = formatMonth(e.hireDate);
      if (!month) continue;
      m.set(month, (m.get(month) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));
  }, [employees]);

  const latestEmployees = useMemo(() => {
    return [...employees]
      .sort(
        (a, b) =>
          new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime(),
      )
      .slice(0, 5);
  }, [employees]);

  const recentAttendance = useMemo(() => {
    return [...attendance]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [attendance]);

  const recentAnnouncements = useMemo(() => {
    return [...announcements]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
  }, [announcements]);

  const recentLogs = useMemo(() => {
    return [...auditLogs]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 6);
  }, [auditLogs]);

  const employeeNameById = (id: number) =>
    employees.find((e) => Number(e.id) === id)?.fullName ??
    employees.find((e) => String(e.id) === String(id))?.fullName ??
    `Employee#${id}`;

  const ui = useMemo(
    () => ({
      departmentName: (departmentId: any) =>
        depMap.get(String(departmentId)) ?? "—",
      storeName: (storeId: any) =>
        storeId == null
          ? "Filial yoxdur"
          : (storeMap.get(String(storeId)) ?? "—"),
    }),
    [depMap, storeMap],
  );

  return {
    loading,
    kpis,
    charts: {
      storeChartData,
      departmentChartData,
      hiresByMonth,
    },
    lists: {
      latestEmployees,
      recentAttendance,
      recentAnnouncements,
      recentLogs,
    },
    employeeNameById,
    ui,
  };
}

export type {
  EmployeeStatus,
  LeaveRequest,
  PayrollItem,
  AttendanceItem,
  Announcement,
  AuditLog,
};
