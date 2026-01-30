import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
