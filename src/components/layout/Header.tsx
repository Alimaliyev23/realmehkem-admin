import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { toggleTheme } from "../../lib/theme";
import { useAuth } from "../../features/auth/AuthContext";

type HeaderProps = {
  onOpenSidebar?: () => void;
};

function buildEmployeesUrl(q: string) {
  const url = new URL(window.location.origin + "/employees");
  const clean = q.trim();
  if (clean) url.searchParams.set("q", clean);
  return url.pathname + url.search;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [q, setQ] = useState("");
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const isEmployees = useMemo(
    () => location.pathname.startsWith("/employees"),
    [location.pathname],
  );

  function onLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(buildEmployeesUrl(q));
  }

  function toggle() {
    const next = toggleTheme();
    setDark(next === "dark");
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur
  dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="font-medium text-gray-900 dark:text-gray-100">
            Admin Panel
            {user?.fullName ? (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                • {user.fullName} ({user.role})
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={onSubmit} className="flex w-full sm:w-[420px] gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Əməkdaş axtar…"
              className="h-10 w-full rounded-lg border px-3 text-sm outline-none
                      border-gray-200 bg-white text-gray-900 placeholder:text-gray-400
                      focus:ring-2 focus:ring-gray-200
                      dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-400
                      dark:focus:ring-white/10"
            />
            <button
              type="submit"
              className="h-10 rounded-lg border px-3 text-sm
                        border-gray-200 bg-white hover:bg-gray-50
                        dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Axtar
            </button>
          </form>

          {isEmployees && (
            <button
              onClick={() => {
                setQ("");
                navigate("/employees", { replace: true });
              }}
              className="h-10 rounded-lg border px-3 text-sm
                         hover:bg-gray-50
                         dark:border-white/10 dark:hover:bg-gray-800"
            >
              Təmizlə
            </button>
          )}

          <button
            onClick={toggle}
            className="h-10 rounded-lg border px-3 text-sm
                       hover:bg-gray-50
                       dark:border-white/10 dark:hover:bg-gray-800"
            title="Dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={onLogout}
            className="h-10 rounded-lg bg-gray-900 px-4 text-sm text-white hover:bg-gray-800
                     dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Çıxış
          </button>
        </div>
      </div>
    </header>
  );
}
