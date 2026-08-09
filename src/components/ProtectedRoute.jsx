import { Navigate } from "react-router-dom";

/**
 * Wraps admin routes — redirects to login if no admin_session in localStorage.
 */
export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("admin_session") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
