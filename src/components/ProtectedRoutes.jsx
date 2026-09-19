import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getCurrentUser } from "../data/mockauth";

export default function ProtectedRoutes({
  children,
  allowedRoles = [],
}) {
  const location = useLocation();
  const auth = getCurrentUser();

  if (!auth || !auth.authenticated) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }

    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    if (auth.role === "worker") {
      return <Navigate to="/worker-dashboard" replace />;
    }

    if (auth.role === "customer") {
      return <Navigate to="/dashboard" replace />;
    }

    if (auth.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}