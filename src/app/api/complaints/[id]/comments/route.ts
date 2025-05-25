import { NextRequest, NextResponse } from 'next/server';
import connect from '@/app/lib/mongodb';
import Complaint from '@/app/models/Complaint';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connect();

        const complaint = await Complaint.findById(params.id);
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json(complaint.comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connect();
        const body = await request.json();

        const complaint = await Complaint.findById(params.id);
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        const comment = {
            userId: body.userId,
            content: body.content,
            isAdminComment: body.isAdminComment || false,
            createdAt: new Date()
        };

        complaint.comments.push(comment);
        await complaint.save();

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
