import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../../lib/api";
type Announcement = {
  id: number;
  title: string;
  content: string;
  audience: "all" | "hr" | "store";
  createdAt: string;
  updatedAt?: string;
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost<TBody, TRes>(path: string, body: TBody): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPut<TBody, TRes>(path: string, body: TBody): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

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

function diffChanged(prev: Announcement, next: Announcement): string[] {
  const changed: string[] = [];
  if (prev.title !== next.title) changed.push("title");
  if (prev.content !== next.content) changed.push("content");
  if (prev.audience !== next.audience) changed.push("audience");
  return changed;
}

function audienceLabel(a: Announcement["audience"]) {
  if (a === "all") return "Hamı";
  if (a === "hr") return "HR";
  return "Mağazalar";
}

export default function AnnouncementsPage() {
  const { user } = useAuth();

  const canCreate = user?.role === "admin" || user?.role === "hr";
  const canEdit = user?.role === "admin" || user?.role === "hr";
  const canDelete = user?.role === "admin";

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Announcement | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("all");

  const [q, setQ] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const data = await apiGet<Announcement[]>(
        "/announcements?_sort=createdAt&_order=desc",
      );
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setAudience("all");
    setEdit(null);
  }

  function openCreate() {
    if (!canCreate) return alert("Elan yaratmağa icazən yoxdur.");
    resetForm();
    setOpen(true);
  }

  function openEdit(item: Announcement) {
    if (!canEdit) return alert("Elanı redaktə etməyə icazən yoxdur.");
    setEdit(item);
    setTitle(item.title);
    setContent(item.content);
    setAudience(item.audience);
    setOpen(true);
  }

  async function submit() {
    const t = title.trim();
    const c = content.trim();

    if (!t) return alert("Başlıq boş ola bilməz.");
    if (t.length < 3) return alert("Başlıq minimum 3 simvol olmalıdır.");
    if (!c) return alert("Mətn boş ola bilməz.");

    try {
      if (edit) {
        if (!canEdit) return alert("Redaktə icazən yoxdur.");

        const next: Announcement = {
          ...edit,
          title: t,
          content: c,
          audience,
          updatedAt: nowIso(),
        };

        const changed = diffChanged(edit, next);

        const saved = await apiPut<Announcement, Announcement>(
          `/announcements/${edit.id}`,
          next,
        );

        await writeAudit({
          actorId: user?.id ?? 0,
          action: "announcement.update",
          entity: "announcements",
          entityId: String(saved.id),
          meta: { title: saved.title, changed },
        });
      } else {
        if (!canCreate) return alert("Yaratmağa icazən yoxdur.");

        const payload: Omit<Announcement, "id"> = {
          title: t,
          content: c,
          audience,
          createdAt: nowIso(),
        };

        const created = await apiPost<typeof payload, Announcement>(
          "/announcements",
          payload,
        );

        await writeAudit({
          actorId: user?.id ?? 0,
          action: "announcement.create",
          entity: "announcements",
          entityId: String(created.id),
          meta: { title: created.title },
        });
      }

      setOpen(false);
      resetForm();
      await refresh();
    } catch (e) {
      console.error(e);
      alert("Xəta oldu. Console-a bax (F12).");
    }
  }

  async function remove(item: Announcement) {
    if (!canDelete) return alert("Silməyə icazən yoxdur.");
    if (!confirm("Bu elanı silmək istəyirsiniz?")) return;

    try {
      await apiDelete(`/announcements/${item.id}`);

      await writeAudit({
        actorId: user?.id ?? 0,
        action: "announcement.delete",
        entity: "announcements",
        entityId: String(item.id),
        meta: { title: item.title },
      });

      await refresh();
    } catch (e) {
      console.error(e);
      alert("Silinmə zamanı xəta baş verdi.");
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((x) => {
      return (
        x.title.toLowerCase().includes(term) ||
        x.content.toLowerCase().includes(term) ||
        x.audience.toLowerCase().includes(term)
      );
    });
  }, [items, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Elanlar</h2>
          <p className="text-sm text-gray-500">
            Daxili elanlar bölməsi (portfolio üçün real funksionallıq).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Yenilə
          </button>

          {canCreate && (
            <button
              onClick={openCreate}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800
                         dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Yeni elan
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Axtar: başlıq / mətn / hədəf qrup..."
          className="h-10 w-full rounded-lg border px-3 text-sm outline-none
                     border-gray-200 bg-white text-gray-900 placeholder:text-gray-400
                     focus:ring-2 focus:ring-gray-200
                     dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-400
                     dark:focus:ring-white/10"
        />
        <button
          onClick={() => setQ("")}
          className="h-10 w-full sm:w-auto rounded-lg border px-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Təmizlə
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-xl border bg-white p-4 text-gray-500 dark:border-white/10 dark:bg-white/5">
            Yüklənir...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-gray-500 dark:border-white/10 dark:bg-white/5">
            Elan tapılmadı.
          </div>
        ) : (
          filtered.map((x) => (
            <div
              key={x.id}
              className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{x.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Hədəf: {audienceLabel(x.audience)} • Yaradılma:{" "}
                    {new Date(x.createdAt).toLocaleString()}
                    {x.updatedAt
                      ? ` • Yenilənmə: ${new Date(x.updatedAt).toLocaleString()}`
                      : ""}
                  </div>
                </div>

                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      onClick={() => openEdit(x)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      Redaktə
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => remove(x)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                {x.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
              <h3 className="text-lg font-semibold">
                {edit ? "Elanı redaktə et" : "Yeni elan"}
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Bağla
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Başlıq
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none
                             border-gray-200 bg-white text-gray-900
                             focus:ring-2 focus:ring-gray-200
                             dark:border-white/10 dark:bg-white/5 dark:text-gray-100
                             dark:focus:ring-white/10"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Hədəf qrup
                </label>
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as Announcement["audience"])
                  }
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none
                             border-gray-200 bg-white text-gray-900
                             dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
                >
                  <option value="all">Hamı</option>
                  <option value="hr">HR</option>
                  <option value="store">Mağazalar</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Mətn
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none
                             border-gray-200 bg-white text-gray-900
                             focus:ring-2 focus:ring-gray-200
                             dark:border-white/10 dark:bg-white/5 dark:text-gray-100
                             dark:focus:ring-white/10"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={submit}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800
                             dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Yadda saxla
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  Ləğv et
                </button>
              </div>

              {!canEdit && (
                <div className="text-xs text-gray-500">
                  Bu rolda dəyişiklik etmək icazən yoxdur. Yalnız baxış
                  mümkündür.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
