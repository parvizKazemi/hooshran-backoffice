import { IconChevronDown, type Icon } from "@tabler/icons-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

export function NavMain({
  items,
  badges,
  completedItems,
}: {
  items: readonly {
    readonly title: string;
    readonly url?: string;
    readonly icon?: Icon;
    readonly items?: readonly {
      readonly title: string;
      readonly url: string;
    }[];
  }[];
  badges?: Record<string, number>;
  completedItems: string[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

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

  const isParentActive = (
    item: (typeof items)[number] & { items: readonly { url: string }[] }
  ) => {
    if (item.url && isActive(item.url)) {
      return true;
    }
    return item.items.some((subItem) => isActive(subItem.url));
  };

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
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
            const menuKey = item.url ?? item.title;
            const badgeCount = item.url ? (badges?.[item.url] ?? 0) : 0;
            const hasSubItems = Boolean(item.items?.length);
            const isExpanded = expandedMenus[menuKey] === true;
            const active = hasSubItems
              ? isParentActive(
                  item as typeof item & { items: readonly { url: string }[] }
                )
              : item.url
                ? isActive(item.url)
                : false;
            const completed = item.url
              ? isCompleted(item.url) || active
              : active;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleMenu(menuKey);
                      return;
                    }
                    if (item.url) {
                      navigate(item.url);
                    }
                  }}
                  aria-expanded={hasSubItems ? isExpanded : undefined}
                  isActive={active}
                  className="relative cursor-pointer"
                >
                  {item.icon && (
                    <item.icon
                      className={
                        completed || hasSubItems
                          ? "text-blue-500 dark:text-emerald-500"
                          : "text-black/40 dark:text-white/40"
                      }
                    />
                  )}
                  <span
                    className={
                      completed || hasSubItems
                        ? "text-black dark:text-white"
                        : "text-black/40 dark:text-white/40"
                    }
                  >
                    {item.title}
                  </span>
                  {hasSubItems && (
                    <IconChevronDown
                      className={cn(
                        "ms-auto size-4 shrink-0 transition-transform duration-200",
                        isExpanded ? "rotate-180" : "rotate-0"
                      )}
                    />
                  )}
                  {badgeCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute end-4 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full p-1 text-[10px]"
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
                {hasSubItems && isExpanded && (
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.url}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(subItem.url)}
                        >
                          <a
                            href={subItem.url}
                            onClick={(event) => {
                              event.preventDefault();
                              navigate(subItem.url);
                            }}
                          >
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
