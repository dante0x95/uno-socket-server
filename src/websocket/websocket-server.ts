import { randomUUID } from "node:crypto";

import { type RawData, WebSocketServer } from "ws";

import { logger } from "../shared/logging/logger.js";

import type { ConnectionRegistry } from "../modules/connections/connection-registry.js";
import type { MessageRouter } from "./message-router.js";

interface CreateWebSocketServerInput {
  port: number;
  messageRouter: MessageRouter;
  connectionRegistry: ConnectionRegistry;
}

function rawDataToString(data: RawData): string {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString("utf8");
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }

  return data.toString("utf8");
}

export function createWebSocketServer(
  input: CreateWebSocketServerInput,
): WebSocketServer {
  const server = new WebSocketServer({
    port: input.port,
  });

  server.on("connection", (socket) => {
    const connectionId = randomUUID();

    input.connectionRegistry.register(connectionId, socket);

    socket.send(
      JSON.stringify({
        type: "connection.ready",
        connectionId,
      }),
    );

    socket.on("message", (data) => {
      const message = rawDataToString(data);

      void input.messageRouter
        .handle(connectionId, socket, message)
        .catch((error: unknown) => {
          logger.error(
            { error, connectionId },
            "Failed to handle WebSocket message",
          );
        });
    });

    socket.on("close", () => {
      input.connectionRegistry.unregister(connectionId);
    });

    socket.on("error", (error) => {
      console.error({
        message: "WebSocket connection error",
        connectionId,
        error,
      });
    });
  });

  return server;
}
