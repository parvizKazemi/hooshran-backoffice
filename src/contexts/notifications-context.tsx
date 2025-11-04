import type { Ticket } from "@/features/tickets/types";
import { mockTickets } from "@/features/tickets/types";
import { useTicketsNotifications } from "@/hooks/use-tickets-notifications";
import * as React from "react";

interface NotificationsContextType {
  ticketsUnreadCount: number;
  isTicketRead: (ticketId: string) => boolean;
  markTicketAsRead: (ticketId: string) => void;
  markAllTicketsAsRead: () => void;
  unreadTickets: Ticket[];
}

const NotificationsContext = React.createContext<
  NotificationsContextType | undefined
>(undefined);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { unreadCount, unreadTickets, markAsRead, markAllAsRead, isRead } =
    useTicketsNotifications(mockTickets);

  const value: NotificationsContextType = {
    ticketsUnreadCount: unreadCount,
    isTicketRead: isRead,
    markTicketAsRead: markAsRead,
    markAllTicketsAsRead: markAllAsRead,
    unreadTickets,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
