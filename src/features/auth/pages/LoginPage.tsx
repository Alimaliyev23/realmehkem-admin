import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const st = location.state as { from?: string } | null;
    return st?.from ?? "/";
  }, [location.state]);

  const [email, setEmail] = useState("admin@demo.az");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login error");
    } finally {
      setLoading(false);
    }
  }
  console.log("LOGIN TRY:", email, password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Realmehkem Admin
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Demo giriş: admin@demo.az / admin123
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Şifrə
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 font-medium disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
          >
            {loading ? "Daxil olunur..." : "Daxil ol"}
          </button>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            HR: <b>hr@demo.az</b> / <b>hr123</b> <br />
            Store manager: <b>manager1@demo.az</b> / <b>manager123</b>
          </div>
        </form>
      </div>
    </div>
  );
}
