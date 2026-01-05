import {
  IconApi,
  IconBell,
  IconChartBar,
  IconCoins,
  IconCreditCard,
  IconDashboard,
  IconFileText,
  IconFolder,
  IconInnerShadowTop,
  IconLogout,
  IconMessage,
  IconPackage,
  IconPhoto,
  IconReceipt,
  IconReport,
  IconSettings,
  IconUserCheck,
  IconUsers,
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
import { type Icon } from "@tabler/icons-react";

function useSidebarData() {
  const { t } = useTranslation("common");
  const { ticketsUnreadCount } = useNotifications();
  return {
    user: {
      name: "shadcn",
      email: "youremail@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("nav.dashboard"),
        url: "/",
        icon: IconDashboard,
      },
      // add users link

      {
        title: t("nav.notifications"),
        url: "/notifications",
        icon: IconBell,
      },
      {
        title: t("nav.packages"),
        url: "/packages",
        icon: IconPackage,
      },
      {
        title: t("nav.serviceRequests"),
        url: "/service-requests",
        icon: IconFileText,
      },
      {
        title: t("nav.userCredits"),
        url: "/user-credits",
        icon: IconCoins,
      },
      {
        title: t("nav.plans"),
        url: "/plans",
        icon: IconCreditCard,
      },
      {
        title: t("nav.users"),
        url: "/users",
        icon: IconUsers,
      },
      {
        title: t("nav.paymentGateways"),
        url: "/payment-gateways",
        icon: IconCreditCard,
      },
      {
        title: t("nav.tickets"),
        url: "/tickets",
        icon: IconMessage,
      },
      {
        title: t("nav.transactions"),
        url: "/transactions",
        icon: IconReport,
      },
      {
        title: t("nav.apiServices"),
        url: "/api-services",
        icon: IconApi,
      },
      {
        title: t("nav.categories"),
        url: "/categories",
        icon: IconFolder,
      },
      {
        title: t("nav.referrals"),
        url: "/referrals",
        icon: IconUserCheck,
      },
      {
        title: t("nav.media"),
        url: "/media",
        icon: IconPhoto,
      },
      {
        title: t("nav.payments"),
        url: "/payments",
        icon: IconReceipt,
      },
      {
        title: t("nav.utmAnalytics"),
        url: "/utm-analytics",
        icon: IconChartBar,
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
              "/service-requests",
              "/notifications",
              "/packages",
              "/user-credits",
            ]}
            // badges={{
            //   "/service-requests": 1,
            //   "/notifications": 1,
            //   "/packages": 1,
            // }}
          />
          {/* <NavDocuments items={data.documents} /> */}
          <NavSecondary
            items={data.navSecondary}
            onItemClick={handleNavItemClick}
            className="mt-auto"
          />
        </SidebarContent>
        {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
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
