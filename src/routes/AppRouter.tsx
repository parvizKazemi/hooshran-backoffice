import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthGuard from "./AuthGuard";
import PrivateRoute from "./PrivateRoute";

const Login = lazy(() => import("../features/auth/Login.tsx"));
const OTPPage = lazy(() => import("../features/auth/OTP.tsx"));
const NotFoundRoute = lazy(() => import("./NotFoundRoute"));

// const Dashboard = lazy(() => import("../features/dashboard/Dashboard.tsx"));
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
const CreditLedgerHistory = lazy(
  () => import("../features/credit-ledger-history/CreditLedgerHistory.tsx")
);
const Packages = lazy(() => import("../features/packages/Packages.tsx"));
const DiscountCodes = lazy(
  () => import("../features/discount-codes/DiscountCodes.tsx")
);
const Plans = lazy(() => import("../features/plans/Plans.tsx"));
const Referrals = lazy(() => import("../features/referrals/Referrals.tsx"));
const Media = lazy(() => import("../features/media/Media.tsx"));
const Payments = lazy(() => import("../features/payments/Payments.tsx"));
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
const WelcomePackagesSettings = lazy(
  () => import("../features/welcome-packages/WelcomePackagesSettings.tsx")
);
const UserBlacklistSettings = lazy(
  () => import("../features/user-settings/UserBlacklistSettings.tsx")
);
const ServiceHintSettings = lazy(
  () => import("../features/service-hint/ServiceHintSettings.tsx")
);
const SmsConfigSettings = lazy(
  () => import("../features/sms-config/SmsConfigSettings.tsx")
);
const ClearUserData = lazy(
  () => import("../features/clear-user-data/ClearUserData.tsx")
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
            element: <Navigate to="/users-and-credits/service-requests" />,
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
            path: "/users-and-credits/service-requests",
            element: <ServiceRequests />,
          },
          {
            path: "/service-requests",
            element: (
              <Navigate to="/users-and-credits/service-requests" replace />
            ),
          },
          {
            path: "/services/categories",
            element: <Categories />,
          },
          {
            path: "/categories",
            element: <Navigate to="/services/categories" replace />,
          },
          {
            path: "/users-and-credits/user-credits",
            element: <UserCredits />,
          },
          {
            path: "/user-credits",
            element: <Navigate to="/users-and-credits/user-credits" replace />,
          },
          {
            path: "/users-and-credits/credit-ledger-history",
            element: <CreditLedgerHistory />,
          },
          {
            path: "/credit-ledger-history",
            element: (
              <Navigate to="/users-and-credits/credit-ledger-history" replace />
            ),
          },
          {
            path: "/packages",
            element: <Packages />,
          },
          {
            path: "/discount-codes",
            element: <DiscountCodes />,
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
            path: "/user-settings/welcome-packages",
            element: <WelcomePackagesSettings />,
          },
          {
            path: "/user-settings/blacklist",
            element: <UserBlacklistSettings />,
          },
          {
            path: "/services/service-hint",
            element: <ServiceHintSettings />,
          },
          {
            path: "/system-settings/sms-config",
            element: <SmsConfigSettings />,
          },
          {
            path: "/system-settings/clear-user-data",
            element: <ClearUserData />,
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
