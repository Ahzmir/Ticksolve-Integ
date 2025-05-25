import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import ComplaintModel from '@/app/models/Complaint';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const id = params.id;
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        const complaint = await ComplaintModel.findById(id);
        if (!complaint) {
            return NextResponse.json({ message: "Complaint not found" }, { status: 404 });
        }

        return NextResponse.json(complaint);
    } catch (error: any) {
        console.error("GET complaint error:", error);
        const statusCode = error.name === "MongooseError" ? 503 : 500;
        return NextResponse.json(
            {
                message: "Failed to fetch complaint",
                error: error.name,
                details: error.message,
            },
            { status: statusCode }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const body = await request.json();
        const complaint = await ComplaintModel.findById(params.id);

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        // Update fields if present
        if (body.description) complaint.description = body.description;
        if (body.complaintType) complaint.complaintType = body.complaintType;

        // 👇 Add a comment if included in the request
        if (body.comment) {
            complaint.comments.push({
                userId: body.comment.userId, // should match schema
                content: body.comment.content,
                isAdminComment: body.comment.isAdminComment || false,
                createdAt: new Date(),
            });
        }

        await complaint.save();

        return NextResponse.json(complaint);
    } catch (error: any) {
        console.error('Error updating complaint:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const id = params.id;
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        const complaint = await ComplaintModel.findById(id);

        if (!complaint) {
            return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
        }

        // Update any provided fields dynamically
        Object.entries(body).forEach(([key, value]) => {
            // Handle comment addition separately if it's in the body
            if (key === "comment" && value && typeof value === "object") {
                complaint.comments.push({
                    userId: value.userId,
                    content: value.content,
                    isAdminComment: value.isAdminComment || false,
                    createdAt: new Date(),
                });
            } else {
                // Dynamically update other fields
                complaint.set(key, value);
            }
        });

        await complaint.save();

        return NextResponse.json(complaint);
    } catch (error: any) {
        console.error("POST update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}