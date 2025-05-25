'use client';

import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { IComplaint } from '@/app/models/Complaint';

interface ComplaintCardProps {
    complaint: {
        id?: string;
        _id?: string;
        studentId?: string;
        complaintType?: string;
        description: string;
        status: string;
        user?: {
            studentId: string;
            firstName: string;
            lastName: string;
        };
        createdAt: string | Date;
        updatedAt?: string | Date;
        comments?: any[];
    };
    isAdmin?: boolean;
    onClick?: () => void;
}

export default function ComplaintCard({ complaint, isAdmin = false, onClick }: ComplaintCardProps) {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'bg-yellow-500';
            case 'in-progress':
            case 'in progress':
                return 'bg-blue-500';
            case 'resolved':
                return 'bg-green-500';
            case 'pending':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(complaint.status)}`} />
                            <h3 className="text-lg font-medium">
                                {complaint.complaintType || 'No Type'} Complaint
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {complaint.description?.length > 100 
                                ? `${complaint.description.substring(0, 100)}...` 
                                : complaint.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                            {complaint.user && (
                                <p>By: {complaint.user.firstName} {complaint.user.lastName}</p>
                            )}
                            <p>Status: {complaint.status}</p>
                            <p>Filed: {formatDate(complaint.createdAt)}</p>
                        </div>
                    </div>
                    {complaint.comments && (
                        <div className="text-sm text-gray-500">
                            {complaint.comments.length} comments
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
