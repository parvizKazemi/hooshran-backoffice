import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

type PrivateRouteProps = {
  redirectTo?: string;
};

export default function PrivateRoute({
  redirectTo = "/login",
}: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
