"use client";

import { ChevronLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { socket } from "@/app/socket";
import { Badge } from "@/app/components/ui/badge";

interface Ticket {
  id: string;
  status: string;
  description: string;
  comments: Array<{
    userId: string;
    content: string;
    isAdminComment: boolean;
    createdAt: string;
  }>;
}

interface User {
  id: string;
  isAdmin: boolean;
}

interface TicketClientComponentProps {
  id: string;
}

export default function TicketClientComponent({ id }: TicketClientComponentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Ticket>({} as Ticket);
  const [user, setUser] = useState<User | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

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

  const fetchTicketData = async () => {
    const storedUser = localStorage.getItem("user");
    const userData = JSON.parse(storedUser!);

    if (id) {
      setUser(userData);
      try {
        const response = await fetch(`/api/complaints/${id}`);
        if (!response.ok) throw new Error("Failed to fetch tickets");
        const ticketData = await response.json();

        console.log(ticketData);

        setTicket(ticketData);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    const storedUser = localStorage.getItem("user");
    const userData = JSON.parse(storedUser!);
    setIsSending(true);
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: {
            userId: userData.id, // Pass actual user ID
            content: commentText,
            isAdminComment: userData.isAdmin || false,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const updatedComplaint = await res.json();
      socket.emit("new-comment", {
        ticketId: id,
        comment: updatedComplaint.comments.at(-1),
      });

      setCommentText(""); // Clear input
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchTicketData();

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      socket.emit("join-room", id);
      console.log("JOINED (USER):", id);
    }

    const onNewComment = (newComment: { userId: string; content: string; isAdminComment: boolean; createdAt: string }) => {
      setTicket((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
    };

    const onNewStatus = (newStatus: string) => {
      setTicket((prev) => ({
        ...prev,
        status: newStatus,
      }));
    };

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-comment", onNewComment);
    socket.on("receive-status", onNewStatus);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-comment", onNewComment);
      socket.off("receive-status", onNewStatus);
    };
  }, [id]);

  if (loading) {
    return <></>;
  }

  return (
    <>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4 items-center">
          <ChevronLeft
            size={24}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h1 className="font-bold text-3xl">Ticket</h1>
        </div>
        <Badge className={getStatusBadgeVariant(ticket.status)}>
          {ticket.status?.charAt(0).toUpperCase() +
            (ticket.status?.slice(1) || "")}
        </Badge>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p>Ticket ID: {ticket.id}</p>
          <p>{ticket.description}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col p-8 rounded-3xl max-h-[70vh] overflow-y-auto bg-gray-100 shadow border border-gray-200 w-full">
            {ticket?.comments?.map((comment, index) => {
              const isSelf = comment.userId === user?.id; // Adjust based on your auth logic
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isSelf ? "self-end" : "self-start"} gap-1`}
                >
                  <div
                    className={`flex flex-row items-center gap-2 ${
                      isSelf ? "self-end" : "self-start"
                    }`}
                  >
                    <p className="text-xs">
                      {comment.isAdminComment ? "Admin" : "User"}
                    </p>
                    <time className="text-xs opacity-50">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <div className="chat-bubble rounded-3xl bg-white p-4 max-w-xs break-words">
                    {comment.content}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-row items-center gap-4">
            <input
              type="text"
              className="px-6 py-2 rounded-3xl bg-gray-50 border border-gray-100 shadow w-full"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSending}
            />
            <button disabled={isSending} onClick={handleSendComment}>
              <Send size={24} className="cursor-pointer flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
