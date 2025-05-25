import { WebSocket, WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

declare global {
    var _wss: WebSocketServer;
    var _clients: Set<WebSocket>;
}

if (!global._wss) {
    global._wss = new WebSocketServer({ noServer: true });
    global._clients = new Set<WebSocket>();

    global._wss.on('connection', (ws: WebSocket) => {
        global._clients.add(ws);        ws.on('message', (data: Buffer) => {            try {
                const message = JSON.parse(data.toString());

                if (message.type === 'new-ticket' || message.type === 'update-ticket') {
                    // Format the message data to ensure consistency
                    const messageData = {
                        ...message.ticket,
                        _id: message.ticket._id || message.ticket.id, // Ensure _id is available
                        createdAt: message.ticket.createdAt?.toString(),
                        updatedAt: message.ticket.updatedAt?.toString()
                    };

                    // Broadcast new or updated ticket to all connected clients
                    const ticketMessage = JSON.stringify({
                        type: message.type === 'new-ticket' ? 'ticket-created' : 'ticket-updated',
                        data: messageData
                    });

                    // Broadcast to all connected clients (especially admin dashboards)
                    global._clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(ticketMessage);
                        }
                    });
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        ws.on('close', () => {
            global._clients.delete(ws);
        });
    });
}

// Handle upgrade request
export async function GET(req: Request) {
    if (!global._wss) {
        return new Response('WebSocket server not initialized', { status: 500 });
    }

    try {
        const { socket, headers } = req as any;
        const head = Buffer.alloc(0);

        global._wss.handleUpgrade(req as any, socket, head, (ws: WebSocket) => {
            global._wss.emit('connection', ws);
        });

        return new Response(null, {
            status: 101,
            headers: {
                'Upgrade': 'websocket',
                'Connection': 'Upgrade'
            }
        });
    } catch (error) {
        console.error('WebSocket upgrade error:', error);
        return new Response('WebSocket upgrade failed', { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
