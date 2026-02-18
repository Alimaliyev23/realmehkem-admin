import { useEffect } from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
    isActive
      ? "bg-gray-900 text-white shadow-sm dark:bg-white/10 dark:text-white"
      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
  }`;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-6">
        <div className="text-lg font-semibold">Realmehkem Admin</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">HR mini panel (demo)</div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClass} onClick={onNavigate}>
          Dashboard
        </NavLink>
        <NavLink to="/employees" className={linkClass} onClick={onNavigate}>
          Employees
        </NavLink>
        <NavLink to="/audit-logs" className={linkClass} onClick={onNavigate}>
          Audit Logs
        </NavLink>
        <NavLink to="/announcements" className={linkClass} onClick={onNavigate}>
          Announcements
        </NavLink>
        <NavLink
          to="/leave-requests"
          className={linkClass}
          onClick={onNavigate}
        >
          Leave Requests
        </NavLink>
      </nav>
    </>
  );
}

export default function Sidebar({
  variant,
  open,
  onClose,
}: {
  variant: "desktop" | "mobile";
  open?: boolean;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (variant !== "mobile") return;
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, variant]);

  if (variant === "desktop") {
    return (
      <aside
        className="
  hidden w-72 shrink-0 border-r p-4 lg:block
  bg-white text-gray-900 border-gray-200
  dark:bg-white/5 dark:text-gray-100 dark:border-white/10
  backdrop-blur
"
      >
        <SidebarContent />
      </aside>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-100 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-2xl
                   translate-x-0 transition-transform duration-200 ease-out dark:bg-slate-900 dark:text-slate-100 dark:border-white/10
    border-r border-gray-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Menu</div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-white/10
    text-gray-700 dark:text-gray-200"
          >
            Bağla
          </button>
        </div>

        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}
