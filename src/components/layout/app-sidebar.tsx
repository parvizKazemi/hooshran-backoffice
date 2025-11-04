import {
  IconBell,
  IconCreditCard,
  IconDashboard,
  IconInnerShadowTop,
  IconMessage,
  IconReport,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import i18next from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { NavMain } from "@/components/layout/nav-main";
import { NavSecondary } from "@/components/layout/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNotifications } from "@/contexts/notifications-context";

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
        title: t("nav.users"),
        url: "/users",
        icon: IconUsers,
      },
      {
        title: t("nav.notifications"),
        url: "/notifications",
        icon: IconBell,
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
    ],

    navSecondary: [
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
  // Determine direction from current language (fa => RTL)
  const isRTL =
    (typeof document !== "undefined" &&
      document.documentElement.dir === "rtl") ||
    i18next.language === "fa";
  return (
    <Sidebar collapsible="offcanvas" {...props} side={isRTL ? "right" : "left"}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">{data.appTitle}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          badges={{
            "/tickets": data.unreadCount,
          }}
        />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
}
