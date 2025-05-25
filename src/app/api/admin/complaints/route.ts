import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import mongoose from 'mongoose';

// Import the Complaint model
const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    complaintType: {
        type: String,
        required: true,
        enum: ['bullying', 'cafeteria', 'grade', 'academic', 'technical', 'administrative', 'facility', 'other']
    },
    description: String,
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'pending'],
        default: 'open'
    },
    comments: [{
        userId: String,
        content: String,
        isAdminComment: Boolean,
        createdAt: Date
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true }
}));

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get status from query params if it exists
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Build query based on status
        const query = status ? { status } : {};

        // Find all complaints and populate user details
        const complaints = await Complaint.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: 'studentId',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    id: '$_id',
                    studentId: 1,
                    complaintType: 1,
                    description: 1,
                    status: 1,
                    comments: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        studentId: '$user.studentId',
                        firstName: '$user.firstName',
                        lastName: '$user.lastName',
                        email: '$user.email'
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json(complaints);
    } catch (error: any) {
        console.error('Error fetching complaints:', error);
        return NextResponse.json(
            { message: 'Failed to fetch complaints', error: error.message },
            { status: 500 }
        );
    }
}
