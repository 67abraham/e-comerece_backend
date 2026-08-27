import { WebSocketServer, WebSocket } from "ws";
import { logger } from "../../lib/logger";
import type { Server } from "http";

const clients = new Set<WebSocket>();
let wss: WebSocketServer | undefined;
let heartbeat: ReturnType<typeof setInterval> | undefined;

export const initialWebsocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        clients.add(ws);
        logger.info("WebSocket client connected");

        ws.on("close", () => clients.delete(ws));
        ws.on("error", () => clients.delete(ws));
        ws.on("pong", () => {
            (ws as WebSocket & { isAlive?: boolean }).isAlive = true;
        });
        (ws as WebSocket & { isAlive?: boolean }).isAlive = true;
    });

    heartbeat = setInterval(() => {
        for (const client of clients) {
            const tracked = client as WebSocket & { isAlive?: boolean };
            if (tracked.isAlive === false) {
                client.terminate();
                clients.delete(client);
                continue;
            }
            tracked.isAlive = false;
            client.ping();
        }
    }, 30_000);
};

export const broadcastMessage = ({ event, data }: { event: string; data: unknown }) => {
    const payload = JSON.stringify({ event, data });
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(payload);
            } catch {
                clients.delete(client);
            }
        }
    }
};

export const closeWebsocket = () => {
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = undefined;
    wss?.close();
    wss = undefined;
    clients.clear();
};
