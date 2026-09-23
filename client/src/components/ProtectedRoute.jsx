import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-skeleton" role="status" aria-label="Loading your session"><span className="loading-spinner" aria-hidden="true" /><div /><div /><div /></div>;
  return !user ? (
    <Navigate to="/login" replace />
  ) : role && user.role !== role ? (
    <Navigate to="/access-denied" replace />
  ) : (
    children
  );
}
