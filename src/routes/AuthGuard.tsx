import { useAuth } from "@/contexts/auth-context";
import {
  clearReturnPath,
  readReturnPath,
  rememberReturnPath,
} from "@/lib/auth/return-path";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const publicRoutes = ["/login", "/otp"];

export default function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    if (isAuthenticated && !isPublicRoute) clearReturnPath();
  }, [isAuthenticated, isPublicRoute]);

  if (!isAuthenticated && !isPublicRoute) {
    rememberReturnPath(`${location.pathname}${location.search}`);
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && isPublicRoute) {
    return <Navigate to={readReturnPath()} replace />;
  }

  return <Outlet />;
}
