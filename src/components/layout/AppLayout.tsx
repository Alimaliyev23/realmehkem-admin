import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220]">
      <div className="mx-auto flex min-h-screen max-w-[1400px] px-2 sm:px-4">
        {/* Desktop */}
        <Sidebar variant="desktop" />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 p-3 sm:p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sidebar
        variant="mobile"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
