import { type Icon } from "@tabler/icons-react";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

export function NavSecondary({
  items,
  onItemClick,
  ...props
}: {
  items: readonly {
    readonly title: string;
    readonly url: string;
    readonly icon: Icon;
  }[];
  onItemClick?: (item: { title: string; url: string; icon: Icon }) => void;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
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

  const handleClick = (item: { title: string; url: string; icon: Icon }) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(item.url);
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            const isLogout = item.url === "/logout";
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => handleClick(item)}
                  isActive={active}
                  className={cn(
                    "cursor-pointer",
                    isLogout &&
                      "text-destructive hover:text-destructive hover:bg-destructive/10 [&>svg]:text-destructive"
                  )}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
