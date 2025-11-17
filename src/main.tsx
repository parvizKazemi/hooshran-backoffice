import { AuthProvider } from "@/contexts/auth-context";
import { NotificationsProvider } from "@/contexts/notifications-context";
import ThemeProvider from "@/contexts/theme-context";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./globals.css";
import "./i18n";
import router from "./routes/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <RouterProvider router={router} />
          <Toaster />
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
