import { io, Socket } from "socket.io-client";
import { Ticket } from "../types/ticket";

let socket: Socket | null = null;

const initializeSocket = () => {
    if (!socket) {
        socket = io();

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });
    }
};

export const subscribeToNewTickets = (callback: (ticket: Ticket) => void) => {
    initializeSocket();
    socket?.on("ticket:new", callback);

    return () => {
        socket?.off("ticket:new", callback);
    };
};

export const subscribeToTicketUpdates = (callback: (ticket: Ticket) => void) => {
    initializeSocket();
    socket?.on("ticket:update", callback);

    return () => {
        socket?.off("ticket:update", callback);
    };
};

export const notifyTicketCreated = (ticket: Ticket) => {
    initializeSocket();
    socket?.emit("ticket:create", ticket);
};

export const notifyTicketUpdated = (ticket: Ticket) => {
    initializeSocket();
    socket?.emit("ticket:update", ticket);
};

export const joinTicketRoom = (ticketId: string) => {
    initializeSocket();
    socket?.emit("join-room", ticketId);
};

// Comment updates
export const onReceiveComment = (
    callback: (comment: string) => void,
    ticketId: string
) => {
    joinTicketRoom(ticketId);
    socket?.on("ticket:receive-comment", callback);
    return () => socket?.off("ticket:receive-comment", callback);
};

// Status updates
export const onReceiveStatus = (
    callback: (status: string) => void,
    ticketId: string
) => {
    joinTicketRoom(ticketId);
    socket?.on("ticket:receive-status", callback);
    return () => socket?.off("ticket:receive-status", callback);
};

export const emitComment = (ticketId: string, comment: string) => {
    initializeSocket();
    socket?.emit("ticket:update-comment", { ticketId, comment });
};

export const emitStatus = (ticketId: string, status: string) => {
    initializeSocket();
    socket?.emit("ticket:update-status", { ticketId, status });
};
