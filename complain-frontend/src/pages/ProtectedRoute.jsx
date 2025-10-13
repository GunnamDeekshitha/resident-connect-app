import React from "react";
import { Navigate } from "react-router-dom";

// roleRequired = "admin" or "user"
const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If not logged in, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role does not match, redirect to appropriate dashboard
  if (roleRequired && role !== roleRequired) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
