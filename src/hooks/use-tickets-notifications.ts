import type { Ticket } from "@/features/tickets/types";
import useLocalStorage from "use-local-storage";

export function useTicketsNotifications(tickets: Ticket[]) {
  const [readTickets, setReadTickets] = useLocalStorage<string[]>(
    "read-tickets",
    []
  );

  const currentReadTickets = readTickets || [];

  const unreadTickets = tickets.filter(
    (ticket) => !currentReadTickets.includes(ticket.id)
  );

  const unreadCount = unreadTickets.length;

  const markAsRead = (ticketId: string) => {
    if (currentReadTickets.includes(ticketId)) return;
    setReadTickets([...currentReadTickets, ticketId]);
  };

  const markAllAsRead = () => {
    const allTicketIds = tickets.map((t) => t.id);
    setReadTickets(allTicketIds);
  };

  const isRead = (ticketId: string) => {
    return currentReadTickets.includes(ticketId);
  };

  return {
    unreadCount,
    unreadTickets,
    markAsRead,
    markAllAsRead,
    isRead,
  };
}
