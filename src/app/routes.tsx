import type { RouteObject } from "react-router-dom";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import EmployeesPage from "../features/employees/pages/EmployeesPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";

const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "employees", element: <EmployeesPage /> },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
];

export const router = createBrowserRouter(routes);
