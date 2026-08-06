import { type ClientMessage, clientMessageSchema } from "./message.schema.js";

import type { ConnectionRegistry } from "../modules/connections/connection-registry.js";
import type { CreateRoom } from "../modules/rooms/create-room.js";
import type { JoinRoom } from "../modules/rooms/join-room.js";
import type { LeaveRoom } from "../modules/rooms/leave-room.js";
import type { WebSocket } from "ws";

interface MessageRouterDependencies {
  createRoom: CreateRoom;
  joinRoom: JoinRoom;
  leaveRoom: LeaveRoom;
  connectionRegistry: ConnectionRegistry;
}

export class MessageRouter {
  constructor(private readonly dependencies: MessageRouterDependencies) {}

  async handle(
    connectionId: string,
    socket: WebSocket,
    rawMessage: string,
  ): Promise<void> {
    const parsedJson = this.parseJson(rawMessage);

    if (!parsedJson) {
      this.send(socket, {
        type: "error",
        code: "INVALID_JSON",
      });

      return;
    }

    const validationResult = clientMessageSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      this.send(socket, {
        type: "error",
        code: "INVALID_MESSAGE",
        details: validationResult.error.flatten(),
      });

      return;
    }

    const message = validationResult.data;

    try {
      switch (message.type) {
        case "room.create": {
          const result = await this.dependencies.createRoom.execute({
            playerId: message.payload.playerId,
            connectionId,
          });

          this.send(socket, {
            type: "room.created",
            requestId: message.requestId,
            room: result.room,
          });

          return;
        }

        case "room.join": {
          const result = await this.dependencies.joinRoom.execute({
            playerId: message.payload.playerId,
            roomCode: message.payload.roomCode,
            connectionId,
          });

          this.broadcastToRoom(result.room.players, {
            type: "room.updated",
            requestId: message.requestId,
            room: result.room,
          });

          return;
        }
        case "room.leave":
          await this.handleLeaveRoom(connectionId, socket, message);
          return;
      }
    } catch (error) {
      this.send(socket, {
        type: "error",
        requestId: message.requestId,
        code: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      });
    }
  }

  private async handleLeaveRoom(
    connectionId: string,
    socket: WebSocket,
    message: Extract<ClientMessage, { type: "room.leave" }>,
  ): Promise<void> {
    const result = await this.dependencies.leaveRoom.execute({
      playerId: message.payload.playerId,
      roomCode: message.payload.roomCode,
    });

    this.send(socket, {
      type: "room.left",
      requestId: message.requestId,
      roomCode: result.room.code,
      playerId: result.playerId,
    });

    if (result.status === "updated") {
      this.broadcastToRoom(result.room.players, {
        type: "room.updated",
        requestId: message.requestId,
        room: result.room,
      });

      return;
    }

    this.broadcastToRoom(result.room.players, {
      type: "room.deleted",
      requestId: message.requestId,
      roomCode: result.room.code,
    });
  }

  private broadcastToRoom(
    players: { connectionId: string }[],
    message: unknown,
  ): void {
    for (const player of players) {
      const socket = this.dependencies.connectionRegistry.get(
        player.connectionId,
      );

      if (socket) {
        this.send(socket, message);
      }
    }
  }

  private send(socket: WebSocket, message: unknown): void {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private parseJson(rawMessage: string): unknown {
    try {
      return JSON.parse(rawMessage);
    } catch {
      return null;
    }
  }
}
