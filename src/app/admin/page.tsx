"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import AdminNav from "../components/admin/AdminNav";
import {
  subscribeToNewTickets,
  subscribeToTicketUpdates,
} from "../lib/websocket";
import { toast } from "../components/ui/use-toast";
import { Ticket } from "../types/ticket";
import Link from "next/link";
import { socket } from "../socket";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  useEffect(() => {
    fetchStudents();
    fetchTickets();

    // Subscribe to real-time ticket updates
    const unsubscribeNewTickets = subscribeToNewTickets((newTicket) => {
      console.log("New ticket received:", newTicket);
      const ticketWithStringDates = {
        ...newTicket,
        createdAt: newTicket.createdAt?.toString(),
        updatedAt: newTicket.updatedAt?.toString(),
      };

      setTickets((prev) => {
        // Check if ticket already exists
        const exists = prev.some((t) => t._id === ticketWithStringDates._id);
        if (exists) return prev;
        return [...prev, ticketWithStringDates];
      });

      toast({
        title: "New Ticket",
        description: `A new ${newTicket.complaintType} ticket has been submitted`,
        variant: "default",
      });
    });

    // Subscribe to ticket updates
    const unsubscribeTicketUpdates = subscribeToTicketUpdates(
      (updatedTicket) => {
        console.log("Ticket update received:", updatedTicket);
        const ticketWithStringDates = {
          ...updatedTicket,
          createdAt: updatedTicket.createdAt?.toString(),
          updatedAt: updatedTicket.updatedAt?.toString(),
        };

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id === ticketWithStringDates._id
              ? ticketWithStringDates
              : ticket
          )
        );

        toast({
          title: "Ticket Updated",
          description: `Ticket status has been updated`,
          variant: "default",
        });
      }
    );

    return () => {
      if (unsubscribeNewTickets) unsubscribeNewTickets();
      if (unsubscribeTicketUpdates) unsubscribeTicketUpdates();
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/users?role=student");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchTickets = async () => {
    try {
      console.log("Fetching tickets...");
      const response = await fetch("/api/admin/complaints");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Convert Date objects to strings
      const formattedData = data.map((ticket: any) => ({
        ...ticket,
        createdAt: ticket.createdAt.toString(),
        updatedAt: ticket.updatedAt?.toString(),
      }));

      console.log("Fetched tickets:", formattedData);
      setTickets(formattedData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/");
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;

    const statusColor =
      {
        open: "bg-yellow-100 text-yellow-800",
        "in-progress": "bg-blue-100 text-blue-800",
        resolved: "bg-green-100 text-green-800",
        pending: "bg-orange-100 text-orange-800",
      }[status.toLowerCase()] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={`${statusColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleTicketClick = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/complaints/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
        }),
      });

      if (!response.ok) throw new Error("Failed to update ticket");

      const updatedTicket = await response.json();
      socket.emit("ticket:update", updatedTicket);

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId
            ? {
                ...updatedTicket,
                createdAt: updatedTicket.createdAt.toString(),
                updatedAt: updatedTicket.updatedAt?.toString(),
              }
            : ticket
        )
      );

      setSelectedTicket(null);

      toast({
        title: "Success",
        description: "Ticket marked as resolved",
        variant: "default",
      });
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast({
        title: "Error",
        description: "Failed to resolve ticket",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const getStudentTickets = (studentId: string) => {
    return tickets.filter((ticket) => ticket.studentId === studentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <Button
              onClick={() => {
                document.cookie =
                  "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                router.push("/");
              }}
              variant="destructive"
              className="flex items-center gap-2"
            >
              Logout
            </Button>
          </div>

          {/* Students Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Students
              </h2>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search by ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaints
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No students found matching your search."
                          : "No students available."}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const studentTickets = getStudentTickets(
                        student.studentId
                      );
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4">
                            {studentTickets.length > 0 ? (
                              <div className="space-y-2">
                                {studentTickets.map((ticket) => (
                                  <div
                                    key={ticket.id}
                                    className="flex items-center gap-2 text-sm hover:bg-gray-100 p-1 rounded cursor-pointer"
                                    onClick={(e) =>
                                      handleTicketClick(ticket, e)
                                    }
                                  >
                                    <span className="font-medium">
                                      {ticket.complaintType}:
                                    </span>
                                    {getStatusBadge(ticket.status)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                No complaints
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl">
            {selectedTicket && (
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedTicket.complaintType.charAt(0).toUpperCase() +
                        selectedTicket.complaintType.slice(1)}{" "}
                      Complaint
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedTicket.studentId &&
                        `Student ID: ${selectedTicket.studentId}`}
                    </p>
                  </div>
                  {getStatusBadge(selectedTicket.status || "open")}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-700">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(
                        selectedTicket.createdAt || ""
                      ).toLocaleString()}
                    </p>
                    {selectedTicket.updatedAt && (
                      <p className="text-sm text-gray-500">
                        Last Updated:{" "}
                        {new Date(selectedTicket.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                  {selectedTicket.status !== "resolved" && (
                    <div className="flex flex-row gap-2">
                      <Link href={`/admin/ticket/${selectedTicket._id}`}>
                        <Button variant="default">View</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
