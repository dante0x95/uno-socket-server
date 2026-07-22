import { ConnectionRegistry } from "./modules/connections/connection-registry.js";
import { CreateRoom } from "./modules/rooms/create-room.js";
import { InMemoryRoomRepository } from "./modules/rooms/in-memory-room.repository.js";
import { JoinRoom } from "./modules/rooms/join-room.js";
import { logger } from "./shared/logging/logger.js";
import { MessageRouter } from "./websocket/message-router.js";
import { createWebSocketServer } from "./websocket/websocket-server.js";

const port = 3000;

const roomRepository = new InMemoryRoomRepository();
const connectionRegistry = new ConnectionRegistry();

const createRoom = new CreateRoom(roomRepository);
const joinRoom = new JoinRoom(roomRepository);

const messageRouter = new MessageRouter({
  createRoom,
  joinRoom,
  connectionRegistry,
});

createWebSocketServer({
  port,
  messageRouter,
  connectionRegistry,
});

logger.info(`WebSocket server listening on ws://localhost:${port}`);
