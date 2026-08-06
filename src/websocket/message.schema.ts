import { z } from "zod/v4";

const createRoomMessageSchema = z.object({
  type: z.literal("room.create"),
  requestId: z.uuid(),
  payload: z.object({
    playerId: z.string().min(1),
  }),
});

const joinRoomMessageSchema = z.object({
  type: z.literal("room.join"),
  requestId: z.uuid(),
  payload: z.object({
    playerId: z.string().min(1),
    roomCode: z.string().min(1).max(10),
  }),
});

const leaveRoomMessageSchema = z.object({
  type: z.literal("room.leave"),
  requestId: z.uuid(),
  payload: z.object({
    playerId: z.string().min(1),
    roomCode: z.string().min(1).max(10),
  }),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
  createRoomMessageSchema,
  joinRoomMessageSchema,
  leaveRoomMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
