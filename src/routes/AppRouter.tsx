import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthGuard from "./AuthGuard";
import PrivateRoute from "./PrivateRoute";

const Login = lazy(() => import("../features/auth/Login.tsx"));
const OTPPage = lazy(() => import("../features/auth/OTP.tsx"));
const NotFoundRoute = lazy(() => import("./NotFoundRoute"));

const Dashboard = lazy(() => import("../features/dashboard/Dashboard.tsx"));
const Users = lazy(() => import("../features/users/Users.tsx"));
const Notifications = lazy(
  () => import("../features/notifications/Notifications.tsx")
);
const PaymentGateways = lazy(
  () => import("../features/payment-gateways/PaymentGateways.tsx")
);
const Tickets = lazy(() => import("../features/tickets/Tickets.tsx"));
const Transactions = lazy(
  () => import("../features/transactions/Transactions.tsx")
);
const Settings = lazy(() => import("../features/settings/Settings.tsx"));

function AboutUsPage() {
  const { t } = useTranslation("common");
  return <div>{t("aboutUs.title")}</div>;
}

function ContactUsPage() {
  const { t } = useTranslation("common");
  return <div>{t("contactUs.title")}</div>;
}

const router = createBrowserRouter([
  {
    element: <AuthGuard />, // Global auth guard - checks localStorage on every route
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/otp",
        element: <OTPPage />,
      },
      {
        path: "/about-us",
        element: <AboutUsPage />,
      },
      {
        path: "/contact-us",
        element: <ContactUsPage />,
      },
      {
        element: <PrivateRoute />, // Additional protection for private routes
        children: [
          {
            path: "/",
            element: <Dashboard />,
          },
          {
            path: "/users",
            element: <Users />,
          },
          {
            path: "/notifications",
            element: <Notifications />,
          },
          {
            path: "/payment-gateways",
            element: <PaymentGateways />,
          },
          {
            path: "/tickets",
            element: <Tickets />,
          },
          {
            path: "/transactions",
            element: <Transactions />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
        ],
      },
      {
        path: "*", // Catch all undefined routes (including 404)
        element: <NotFoundRoute />,
      },
    ],
  },
]);

export default router;
