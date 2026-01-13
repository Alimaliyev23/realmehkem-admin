import React from "react";
import { Navigate } from "react-router-dom";
import { storage } from "../../lib/storage";

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const token = storage.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
