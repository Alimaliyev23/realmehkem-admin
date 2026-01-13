// src/components/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
