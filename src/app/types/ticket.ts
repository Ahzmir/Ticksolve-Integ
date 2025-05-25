// Define all available complaint types
export type ComplaintType =
  | "bullying"
  | "cafeteria"
  | "grade"
  | "academic"
  | "technical"
  | "administrative"
  | "facility"
  | "other";

// Define ticket status types
export type TicketStatus = "open" | "in-progress" | "resolved" | "pending";

// Define the Ticket interface
export interface Ticket {
  _id?: string;
  id?: string;
  studentId?: string;
  complaintType: ComplaintType;
  type?: ComplaintType; // For backward compatibility with existing components
  description: string;
  status?: TicketStatus;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    studentId: string;
    firstName: string;
    lastName: string;
  };
}
