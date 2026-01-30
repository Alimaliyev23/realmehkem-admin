import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { actionLabels, formatAuditMeta } from "../auditFormatters";
import { API_BASE_URL } from "../../../lib/api";

type AuditLog = {
  id: number;
  at: string;
  actorId: number;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, any>;
};

type DbUser = {
  id: number;
  fullName: string;
  role: "admin" | "hr" | "store_manager";
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  if (Number.isNaN(d.getTime())) return dtIso;
  return d.toLocaleString();
}

function actionBadgeClass(action: string) {
  if (action.endsWith(".create")) return "bg-green-100 text-green-700";
  if (action.endsWith(".update")) return "bg-yellow-100 text-yellow-700";
  if (action.endsWith(".delete")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function AuditLogsPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [action, setAction] = useState<string>("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [logs, dbUsers] = await Promise.all([
        apiGet<AuditLog[]>("/auditLogs?_sort=at&_order=desc"),
        apiGet<DbUser[]>("/users"),
      ]);
      setItems(logs);
      setUsers(dbUsers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  const actionOptions = useMemo(() => {
    const set = new Set(items.map((x) => x.action).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((x) => {
      if (action && x.action !== action) return false;
      if (!term) return true;

      const actorName = userMap.get(x.actorId)?.fullName?.toLowerCase() ?? "";
      const metaText = x.meta ? JSON.stringify(x.meta).toLowerCase() : "";

      return (
        String(x.actorId).includes(term) ||
        actorName.includes(term) ||
        x.action.toLowerCase().includes(term) ||
        (actionLabels[x.action]?.toLowerCase() ?? "").includes(term) ||
        x.entity.toLowerCase().includes(term) ||
        x.entityId.toLowerCase().includes(term) ||
        metaText.includes(term)
      );
    });
  }, [items, q, action, userMap]);

  // İstəsən yalnız admin görsün:
  // if (user?.role !== "admin") return <div>Bu səhifəyə giriş icazən yoxdur.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Audit Jurnalı</h2>
          <p className="text-sm text-gray-500">
            Sistemdə baş verən dəyişikliklər.{" "}
            {user ? `Giriş edən: ${user.fullName}` : ""}
          </p>
        </div>

        <button
          onClick={refresh}
          className="w-full sm:w-auto rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Yenilə
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Axtar: istifadəçi / action / entityId / meta..."
          className="h-10 w-full rounded-lg border px-3 text-sm outline-none
                     border-gray-200 bg-white text-gray-900 placeholder:text-gray-400
                     focus:ring-2 focus:ring-gray-200
                     dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-400
                     dark:focus:ring-white/10"
        />

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-10 w-full sm:w-[280px] rounded-lg border px-3 text-sm outline-none
                     border-gray-200 bg-white text-gray-900
                     dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
        >
          <option value="">Hadisə (hamısı)</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>
              {actionLabels[a] ?? a}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setQ("");
            setAction("");
          }}
          className="h-10 w-full sm:w-auto rounded-lg border px-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Təmizlə
        </button>
      </div>

      <div className="rounded-xl border bg-white p-3 dark:border-white/10 dark:bg-white/5">
        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-2 text-sm text-gray-500">
          {loading ? "Yüklənir..." : `Nəticə: ${filtered.length}`}
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 dark:text-gray-300">
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="py-2 pr-4">Tarix</th>
                <th className="py-2 pr-4">Hadisə</th>
                <th className="py-2 pr-4">İcra edən</th>
                <th className="py-2 pr-4">Obyekt</th>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-2">Detallar</th>
              </tr>
            </thead>

            <tbody className="text-gray-900 dark:text-gray-100">
              {!loading &&
                filtered.map((x) => {
                  const actor = userMap.get(x.actorId);
                  return (
                    <tr
                      key={x.id}
                      className="border-b border-gray-100 dark:border-white/5"
                    >
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {fmt(x.at)}
                      </td>

                      <td className="py-2 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-xs ${actionBadgeClass(
                            x.action,
                          )}`}
                        >
                          {actionLabels[x.action] ?? x.action}
                        </span>
                      </td>

                      <td className="py-2 pr-4 whitespace-nowrap">
                        {actor ? (
                          <div className="leading-tight">
                            <div className="font-medium">{actor.fullName}</div>
                            <div className="text-xs text-gray-500">
                              {actor.role}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">{x.actorId}</span>
                        )}
                      </td>

                      <td className="py-2 pr-4 whitespace-nowrap">
                        {x.entity}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {x.entityId}
                      </td>

                      <td className="py-2 pr-2">
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {formatAuditMeta(x.meta)}
                        </span>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={6}>
                    Audit log tapılmadı.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={6}>
                    Yüklənir...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
