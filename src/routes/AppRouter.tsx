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
const ApiServices = lazy(
  () => import("../features/api-services/ApiServices.tsx")
);
const ServiceRequests = lazy(
  () => import("../features/service-requests/ServiceRequests.tsx")
);
const Categories = lazy(() => import("../features/categories/Categories.tsx"));
const UserCredits = lazy(
  () => import("../features/user-credits/UserCredits.tsx")
);
const Packages = lazy(() => import("../features/packages/Packages.tsx"));
const Plans = lazy(() => import("../features/plans/Plans.tsx"));
const Referrals = lazy(() => import("../features/referrals/Referrals.tsx"));
const Media = lazy(() => import("../features/media/Media.tsx"));
const Payments = lazy(() => import("../features/payments/Payments.tsx"));
const UtmAnalytics = lazy(
  () => import("../features/utm-analytics/UtmAnalytics.tsx")
);
const UserFreezeSettings = lazy(
  () => import("../features/user-settings/UserFreezeSettings.tsx")
);
const UserPurchasePaymentSettings = lazy(
  () => import("../features/user-settings/UserPurchasePaymentSettings.tsx")
);
const UserRegistrationSettings = lazy(
  () => import("../features/user-settings/UserRegistrationSettings.tsx")
);
const UserRequestToolsGateSettings = lazy(
  () => import("../features/user-settings/UserRequestToolsGateSettings.tsx")
);
const UserBlacklistSettings = lazy(
  () => import("../features/user-settings/UserBlacklistSettings.tsx")
);

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
          {
            path: "/api-services",
            element: <ApiServices />,
          },
          {
            path: "/service-requests",
            element: <ServiceRequests />,
          },
          {
            path: "/categories",
            element: <Categories />,
          },
          {
            path: "/user-credits",
            element: <UserCredits />,
          },
          {
            path: "/packages",
            element: <Packages />,
          },
          {
            path: "/plans",
            element: <Plans />,
          },
          {
            path: "/referrals",
            element: <Referrals />,
          },
          {
            path: "/media",
            element: <Media />,
          },
          {
            path: "/payments",
            element: <Payments />,
          },
          {
            path: "/utm-analytics",
            element: <UtmAnalytics />,
          },
          {
            path: "/user-settings/freeze-management",
            element: <UserFreezeSettings />,
          },
          {
            path: "/user-settings/purchase-payments",
            element: <UserPurchasePaymentSettings />,
          },
          {
            path: "/user-settings/registrations",
            element: <UserRegistrationSettings />,
          },
          {
            path: "/user-settings/request-tools-gate",
            element: <UserRequestToolsGateSettings />,
          },
          {
            path: "/user-settings/blacklist",
            element: <UserBlacklistSettings />,
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
