import { useAuth } from "@/contexts/auth-context";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/otp"];

export default function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // If user is not authenticated and trying to access a private route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated and trying to access login/otp, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
