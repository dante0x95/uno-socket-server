import { describe, expect, it, vi } from "vitest";

import { CreateRoom, type CreateRoomRepository } from "./create-room.js";

describe("createRoom", () => {
  it("creates a room with the requesting player as owner", async () => {
    const mockRoomRepository: CreateRoomRepository = {
      save: vi.fn(),
    };

    const createRoomInstance = new CreateRoom(mockRoomRepository);

    const input = { playerId: "player1", connectionId: "connection1" };
    const result = await createRoomInstance.execute(input);

    expect(result.room.id).toEqual(expect.any(String));
    expect(result.room.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(result.room.ownerId).toBe(input.playerId);
    expect(result.room.players).toEqual([{ id: input.playerId, connectionId: input.connectionId }]);
    expect(result.room.createdAt).toBeInstanceOf(Date);
  });

  it("saves the room using the RoomRepository", async () => {
    const save = vi.fn();

    const mockRoomRepository: CreateRoomRepository = {
      save,
    };

    const createRoomInstance = new CreateRoom(mockRoomRepository);

    const input = { playerId: "player1", connectionId: "connection1" };
    await createRoomInstance.execute(input);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({
      ownerId: input.playerId,
      players: [{ id: input.playerId, connectionId: input.connectionId }],
    }));
  });

  it("throws when the repository cannot save the room", async () => {
    const repositoryError = new Error("Failed to save room");
    const mockRoomRepository: CreateRoomRepository = {
      save: vi.fn().mockRejectedValue(repositoryError),
    };

    const createRoomInstance = new CreateRoom(mockRoomRepository);

    const input = { playerId: "player1", connectionId: "connection1" };

    await expect(createRoomInstance.execute(input)).rejects.toBe(repositoryError);
  });
});
