"use client";

import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Ticket } from "@/app/types/ticket";

interface TicketListProps {
  tickets: Ticket[];
  onCreateTicket?: () => void;
  onViewTicket?: (ticket: Ticket) => void;
  onEditTicket?: (ticket: Ticket) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export default function TicketList({
  tickets = [],
  onCreateTicket = () => {},
  onViewTicket = () => {},
  onEditTicket = () => {},
  onDeleteTicket = () => {},
}: TicketListProps) {
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new ticket.
        </p>
        <div className="mt-6">
          <Button onClick={onCreateTicket}>Create New Ticket</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card
          key={ticket._id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onViewTicket(ticket)}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">
                {ticket.complaintType.charAt(0).toUpperCase() +
                  ticket.complaintType.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {ticket.description}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>
                  Created: {ticket.createdAt && formatDate(ticket.createdAt)}
                </span>
                {ticket.updatedAt && (
                  <>
                    <span>•</span>
                    <span>Updated: {formatDate(ticket.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>
            <Badge className={getStatusBadgeVariant(ticket.status)}>
              {ticket.status?.charAt(0).toUpperCase() +
                (ticket.status?.slice(1) || "")}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
