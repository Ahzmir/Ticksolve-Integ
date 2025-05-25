'use client';

import { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { IComplaint } from '../../models/Complaint';
import ComplaintCard from '../../components/ComplaintCard';

export default function AdminHistory() {
    const [complaints, setComplaints] = useState<IComplaint[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResolvedComplaints();
    }, []);

    const fetchResolvedComplaints = async () => {
        try {
            const response = await fetch('/api/admin/complaints?status=resolved');
            const data = await response.json();
            if (response.ok) {
                setComplaints(data);
            }
        } catch (error) {
            console.error('Error fetching resolved complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(complaint => 
        complaint.user?.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${complaint.user?.firstName} ${complaint.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminNav />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                        Resolved Complaints History
                    </h1>

                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by student ID or name..."
                            className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : filteredComplaints.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredComplaints.map((complaint) => (
                                <ComplaintCard 
                                    key={complaint.id} 
                                    complaint={complaint}
                                    isAdmin={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            No resolved complaints found
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
