import type { RouteObject } from "react-router-dom";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import EmployeesPage from "../features/employees/pages/EmployeesPage";
import AuditLogsPage from "../features/audit/pages/AuditLogsPage";
import AnnouncementsPage from "../features/announcements/pages/AnnouncementsPage";
import LeaveRequestsPage from "../features/leave/pages/LeaveRequestsPage";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "employees",
        element: <EmployeesPage />,
      },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "announcements", element: <AnnouncementsPage /> },
      { path: "leave-requests", element: <LeaveRequestsPage /> },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export const router = createBrowserRouter(routes);
