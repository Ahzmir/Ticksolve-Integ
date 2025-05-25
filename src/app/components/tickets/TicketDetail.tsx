"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Trash2, Edit, Eye } from "lucide-react";
import { Ticket } from "@/app/types/ticket";
import Link from "next/link";

interface TicketDetailProps {
  ticket: Ticket;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticketId: string) => void;
  onClose?: () => void;
  userId: string;
}

export default function TicketDetail({
  ticket,
  onEdit = () => {},
  onDelete = () => {},
  onClose = () => {},
  userId,
}: TicketDetailProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    onEdit(ticket);
  };

  const handleDelete = () => {
    if (ticket._id) {
      onDelete(ticket._id);
    }
    setIsDeleteDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getComplaintTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-background">
      <Card className="w-full shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">
                {getComplaintTypeLabel(ticket.complaintType)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ticket #{ticket._id}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(ticket.status || "open")}`}
                ></div>
                <Badge variant="outline" className="capitalize">
                  {ticket.status || "open"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="mt-2 text-foreground">{ticket.description}</p>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Submitted on
              </h3>
              <p className="mt-1 text-sm">
                {ticket.createdAt && formatDate(ticket.createdAt)}
              </p>
            </div>

            {ticket.updatedAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Last updated
                </h3>
                <p className="mt-1 text-sm">{formatDate(ticket.updatedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex space-x-2">
            {ticket.status == "open" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the ticket and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            <Link href={`ticket/${ticket._id}`}>
              <Button variant="outline" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
