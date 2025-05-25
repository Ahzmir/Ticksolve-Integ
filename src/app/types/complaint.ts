
export interface Complaint {
    id: string;
    studentId: string;
    complaintType: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'pending';
    user?: {
        studentId: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt?: string;
}
