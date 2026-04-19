import { Navigate, Outlet } from "react-router-dom";
import { getDashboardPath } from "../../constants/roles.js";
import { useAuth } from "../../context/AuthContext.jsx";

export function RoleRoute({ allowed }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
