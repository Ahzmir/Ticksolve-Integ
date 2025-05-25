"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import TicketList from "../components/tickets/TicketList";
import TicketModal from "../components/tickets/TicketModal";
import TicketDetail from "../components/tickets/TicketDetail";
import { toast } from "@/app/components/ui/use-toast";
import {
  notifyTicketCreated,
  notifyTicketUpdated,
  subscribeToNewTickets,
  subscribeToTicketUpdates,
} from "../lib/websocket";
import { Ticket, ComplaintType, TicketStatus } from "../types/ticket";
import Menu from "../components/Menu";
import { socket } from "../socket";

interface User {
  studentId: string;
  firstName: string;
  lastName: string;
  role: string;
  id: string;
}

const transformTicket = (data: any): Ticket => ({
  _id: data.id?.toString(),
  id: data.id?.toString(),
  studentId: data.studentId,
  complaintType: data.complaintType as ComplaintType,
  type: data.complaintType as ComplaintType,
  description: data.description,
  status: data.status as TicketStatus,
  createdAt:
    data.createdAt instanceof Date
      ? data.createdAt.toISOString()
      : data.createdAt,
  updatedAt:
    data.updatedAt instanceof Date
      ? data.updatedAt?.toISOString()
      : data.updatedAt,
  user: data.user,
});

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchTickets();

    const onUpdatedStatus = async (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === updatedTicket._id ? transformTicket(updatedTicket) : t
        )
      );
    };

    socket.on("ticket:update", onUpdatedStatus);

    return () => {
      socket.off("ticket:receive", onUpdatedStatus);
    };
  }, [router]);

  const fetchTickets = async () => {
    const storedUser = localStorage.getItem("user");
    const userData = JSON.parse(storedUser!);

    try {
      const response = await fetch(
        `/api/complaints?studentId=${userData?.studentId}`
      );

      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();

      console.log(data);

      setTickets(data.map(transformTicket));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData: Partial<Ticket>) => {
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...ticketData,
          studentId: user?.studentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const newTicket = await response.json();
      const transformedTicket = transformTicket(newTicket);

      setTickets((prev) => [...prev, transformedTicket]);
      setIsCreateModalOpen(false);

      // Notify other clients about the new ticket
      notifyTicketCreated(transformedTicket);

      toast({
        title: "Success",
        description: "Ticket created successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    }
  };

  const handleEditTicket = async (ticket: Ticket) => {
    setEditingTicket(ticket);
  };

  const handleUpdateTicket = async (updatedTicket: Partial<Ticket>) => {
    try {
      const ticketId = updatedTicket._id || updatedTicket.id;
      if (!ticketId) {
        throw new Error("No ticket ID provided");
      }

      const response = await fetch(`/api/complaints/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintType: updatedTicket.complaintType || updatedTicket.type,
          description: updatedTicket.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update ticket");
      }

      const updated = await response.json();
      const transformedTicket = transformTicket(updated);

      setTickets((prev) =>
        prev.map((t) =>
          t._id === transformedTicket._id ? transformedTicket : t
        )
      );
      setEditingTicket(null);

      // Notify other clients about the ticket update
      notifyTicketUpdated(transformedTicket);

      toast({
        title: "Success",
        description: "Ticket updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/complaints?id=${ticketId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      setSelectedTicket(null);

      toast({
        title: "Success",
        description: "Ticket deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive",
      });
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  // Add navigation handlers
  const handleHistoryClick = () => {
    router.push("/history");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <Menu
            onHistoryClick={handleHistoryClick}
            onProfileClick={handleProfileClick}
            onLogoutClick={handleLogoutClick}
          />
        </header>

        <Button onClick={() => setIsCreateModalOpen(true)} className="mb-6">
          Create New Ticket
        </Button>

        <TicketList
          tickets={tickets}
          onCreateTicket={() => setIsCreateModalOpen(true)}
          onViewTicket={handleViewTicket}
          onEditTicket={handleEditTicket}
          onDeleteTicket={handleDeleteTicket}
        />

        {isCreateModalOpen && (
          <TicketModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateTicket}
            mode="create"
          />
        )}

        {editingTicket && (
          <TicketModal
            isOpen={!!editingTicket}
            onClose={() => setEditingTicket(null)}
            onSubmit={handleUpdateTicket}
            mode="edit"
            ticket={editingTicket}
          />
        )}

        <Dialog
          open={!!selectedTicket}
          onOpenChange={(open: boolean) => !open && handleCloseTicket()}
        >
          <DialogContent className="max-w-3xl">
            {selectedTicket && (
              <TicketDetail
                ticket={selectedTicket}
                onClose={handleCloseTicket}
                onEdit={handleEditTicket}
                onDelete={handleDeleteTicket}
                userId={user?.studentId || ""}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
