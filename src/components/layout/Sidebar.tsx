import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 ${
    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
  }`;

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-6 text-lg font-semibold">Realmehkem Admin</div>

      <nav className="space-y-2">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/employees" className={linkClass}>
          Employees
        </NavLink>
      </nav>
    </aside>
  );
}
