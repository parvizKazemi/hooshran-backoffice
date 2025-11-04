import { type Icon } from "@tabler/icons-react";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export function NavSecondary({
  items,
  ...props
}: {
  items: readonly {
    readonly title: string;
    readonly url: string;
    readonly icon: Icon;
  }[];
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

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => navigate(item.url)}
                  isActive={active}
                  className="cursor-pointer"
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
