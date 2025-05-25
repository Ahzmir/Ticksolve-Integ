import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import ComplaintModel from '@/app/models/Complaint';
import { WebSocket } from 'ws';

declare global {
  var wss: {
    clients: Set<WebSocket>;
  };
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
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        complaint.status = body.status;
        await complaint.save();

        // Broadcast the update through WebSocket
        const clients = global.wss?.clients;
        if (clients) {
            clients.forEach((client: WebSocket) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({
                        type: 'complaint-update',
                        complaint: complaint.toJSON()
                    }));
                }
            });
        }

        return NextResponse.json(complaint);
    } catch (error: any) {
        console.error('Error updating complaint:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
