import {
  IconActivityHeartbeat,
  IconApi,
  IconBell,
  IconCoins,
  IconCreditCard,
  IconInnerShadowTop,
  IconLogout,
  IconPackage,
  IconServerCog,
  IconSettings,
  IconTicket,
} from "@tabler/icons-react";
import i18next from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notifications-context";
import { isTestMode } from "@/lib/env";
import { type Icon } from "@tabler/icons-react";

function useSidebarData() {
  const { t } = useTranslation("common");
  const { ticketsUnreadCount } = useNotifications();

  const systemSettingsItems = [
    {
      title: t("nav.systemSettings.smsConfig"),
      url: "/system-settings/sms-config",
    },
    ...(isTestMode
      ? [
          {
            title: t("nav.systemSettings.clearUserData"),
            url: "/system-settings/clear-user-data",
          },
        ]
      : []),
  ];

  return {
    user: {
      name: "shadcn",
      email: "youremail@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("nav.usersAndCredits.title"),
        icon: IconCoins,
        items: [
          {
            title: t("nav.usersAndCredits.serviceRequests"),
            url: "/users-and-credits/service-requests",
          },
          {
            title: t("nav.usersAndCredits.userCredits"),
            url: "/users-and-credits/user-credits",
          },
          {
            title: t("nav.usersAndCredits.creditLedgerHistory"),
            url: "/users-and-credits/credit-ledger-history",
          },
        ],
      },
      {
        title: t("nav.notifications"),
        url: "/notifications",
        icon: IconBell,
      },
      {
        title: t("nav.monitoring"),
        url: "/monitoring",
        icon: IconActivityHeartbeat,
      },
      {
        title: t("nav.affiliate"),
        url: "/affiliate",
        icon: IconCoins,
      },
      {
        title: t("nav.packages"),
        url: "/packages",
        icon: IconPackage,
      },
      {
        title: t("nav.discountCodes"),
        url: "/discount-codes",
        icon: IconTicket,
      },
      {
        title: t("nav.purchasePayments.title"),
        icon: IconCreditCard,
        items: [
          {
            title: t("nav.purchasePayments.gateStatus"),
            url: "/purchase-payments/gate-status",
          },
          {
            title: t("nav.purchasePayments.methods"),
            url: "/purchase-payments/methods",
          },
        ],
      },
      {
        title: t("nav.services.title"),
        icon: IconApi,
        items: [
          {
            title: t("nav.services.categories"),
            url: "/services/categories",
          },
          {
            title: t("nav.services.manageServices"),
            url: "/services/manage",
          },
          {
            title: t("nav.services.serviceHint"),
            url: "/services/service-hint",
          },
          {
            title: t("nav.services.promptAssistant"),
            url: "/services/prompt-assistant",
          },
          {
            title: t("nav.services.promptAssistantServices"),
            url: "/services/prompt-assistant/services",
          },
        ],
      },
      {
        title: t("nav.userSettings.title"),
        icon: IconSettings,
        items: [
          {
            title: t("nav.userSettings.maintenanceMode"),
            url: "/user-settings/maintenance-mode",
          },
          {
            title: t("nav.userSettings.freezeManagement"),
            url: "/user-settings/freeze-management",
          },
          {
            title: t("nav.userSettings.requestToolsGate"),
            url: "/user-settings/request-tools-gate",
          },
          // {
          //   title: t("nav.userSettings.registrations"),
          //   url: "/user-settings/registrations",
          // },
          {
            title: t("nav.userSettings.welcomePackages"),
            url: "/user-settings/welcome-packages",
          },
          {
            title: t("nav.userSettings.blacklist"),
            url: "/user-settings/blacklist",
          },
        ],
      },
      {
        title: t("nav.systemSettings.title"),
        icon: IconServerCog,
        items: systemSettingsItems,
      },
    ],

    navSecondary: [
      {
        title: t("nav.logout"),
        url: "/logout",
        icon: IconLogout,
      },
      {
        title: t("nav.settings"),
        url: "/settings",
        icon: IconSettings,
      },
    ],

    appTitle: t("app.title"),
    unreadCount: ticketsUnreadCount,
  } as const;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = useSidebarData();
  const { t } = useTranslation("common");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  // Determine direction from current language (fa => RTL)
  const isRTL =
    (typeof document !== "undefined" &&
      document.documentElement.dir === "rtl") ||
    i18next.language === "fa";

  const handleNavItemClick = (item: {
    title: string;
    url: string;
    icon: Icon;
  }) => {
    if (item.url === "/logout") {
      setIsLogoutDialogOpen(true);
    } else {
      navigate(item.url);
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutDialogOpen(false);
    navigate("/login");
  };

  return (
    <>
      <Sidebar
        collapsible="offcanvas"
        {...props}
        side={isRTL ? "right" : "left"}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <a href="#">
                  <IconInnerShadowTop className="size-5!" />
                  <span className="text-base font-semibold">
                    {data.appTitle}
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain
            items={data.navMain}
            completedItems={[
              "/users-and-credits",
              "/notifications",
              "/monitoring",
              "/affiliate",
              "/packages",
              "/purchase-payments",
              "/user-settings",
              "/user-settings/welcome-packages",
              "/discount-codes",
              "/services/categories",
              "/services/manage",
              "/services/prompt-assistant",
              "/system-settings/sms-config",
              ...(isTestMode ? ["/system-settings/clear-user-data"] : []),
            ]}
            // badges={{
            //   "/users-and-credits/service-requests": 1,
            //   "/notifications": 1,
            //   "/packages": 1,
            // }}
          />
          <NavSecondary
            items={data.navSecondary}
            onItemClick={handleNavItemClick}
            className="mt-auto"
          />
        </SidebarContent>
      </Sidebar>

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nav.logoutConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nav.logoutConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("users.resetPassword.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {t("nav.logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
