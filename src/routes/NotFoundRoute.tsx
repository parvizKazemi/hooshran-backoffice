import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";

/**
 * Catch-all route for undefined paths
 * If user is not authenticated, redirects to login
 * If authenticated, shows 404 page
 */
export default function NotFoundRoute() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("common");

  // If not authenticated, redirect to login (AuthGuard will handle this too, but this is explicit)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show 404 page
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t("notFound.title")}</h1>
        <p className="text-muted-foreground mt-4">{t("notFound.message")}</p>
      </div>
    </div>
  );
}
