import { type Icon } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export function NavMain({
  items,
  badges,
  completedItems,
}: {
  items: readonly {
    readonly title: string;
    readonly url: string;
    readonly icon?: Icon;
  }[];
  badges?: Record<string, number>;
  completedItems: string[];
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (url: string) => {
    // For root path, match exactly
    if (url === "/") {
      return location.pathname === "/";
    }
    // For other paths, match if pathname starts with the url
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  const isCompleted = (url: string) => {
    return completedItems.includes(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          {items.map((item) => {
            const badgeCount = badges?.[item.url] || 0;
            const active = isActive(item.url);
            const completed = isCompleted(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => navigate(item.url)}
                  isActive={active}
                  className="relative cursor-pointer"
                >
                  {item.icon && (
                    <item.icon
                      className={
                        completed
                          ? "text-blue-500 dark:text-emerald-500"
                          : "text-black/40 dark:text-white/40"
                      }
                    />
                  )}
                  <span
                    className={
                      completed
                        ? "text-black dark:text-white"
                        : "text-black/40 dark:text-white/40"
                    }
                  >
                    {item.title}
                  </span>
                  {badgeCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute end-4 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full p-1 text-[10px]"
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
