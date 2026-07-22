import { describe, expect, it, vi } from "vitest";

import { JoinRoom } from "./join-room.js";

import type { RoomRepository } from "./room.repository.js";

describe("joinRoom", () => {
  it("should throw an error if the room does not exist", async () => {
    const save = vi.fn();
    const mockRoomRepository: RoomRepository = {
      save,
      findByCode: vi.fn().mockResolvedValue(null),
    };

    const joinRoomInstance = new JoinRoom(mockRoomRepository);
    const input = { playerId: "player1", connectionId: "connection1", roomCode: "ABC123" };
    await expect(joinRoomInstance.execute(input)).rejects.toThrow("ROOM_NOT_FOUND");
    expect(save).not.toHaveBeenCalled();
  });

  it("should throw an error if the player has already joined the room", async () => {
    const existingRoom = {
      id: "room1",
      code: "ABC123",
      ownerId: "owner1",
      players: [{ id: "player1", connectionId: "connection1" }],
      createdAt: new Date(),
    };

    const save = vi.fn();
    const mockRoomRepository: RoomRepository = {
      save: vi.fn(),
      findByCode: vi.fn().mockResolvedValue(existingRoom),
    };

    const joinRoomInstance = new JoinRoom(mockRoomRepository);
    const input = { playerId: "player1", connectionId: "connection2", roomCode: "ABC123" };
    await expect(joinRoomInstance.execute(input)).rejects.toThrow("PLAYER_ALREADY_JOINED");
    expect(save).not.toHaveBeenCalled();
  });

  it("should add the player to the room and save the updated room", async () => {
    const existingRoom = {
      id: "room1",
      code: "ABC123",
      ownerId: "owner1",
      players: [
        {
          id: "owner1",
          connectionId: "owner-connection",
        },
      ],
      createdAt: new Date(),
    };

    const save = vi.fn();
    const mockRoomRepository: RoomRepository = {
      save,
      findByCode: vi.fn().mockResolvedValue(existingRoom),
    };

    const joinRoom = new JoinRoom(mockRoomRepository);

    const input = {
      playerId: "player1",
      connectionId: "connection1",
      roomCode: "ABC123",
    };

    const result = await joinRoom.execute(input);

    expect(result.room.players).toEqual([
      {
        id: "owner1",
        connectionId: "owner-connection",
      },
      {
        id: "player1",
        connectionId: "connection1",
      },
    ]);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(result.room);
  });

  it("should normalize the room code to uppercase and trim whitespace", async () => {
    const existingRoom = {
      id: "room1",
      code: "ABC123",
      ownerId: "owner1",
      players: [],
      createdAt: new Date(),
    };

    const save = vi.fn();
    const findByCode = vi.fn().mockResolvedValue(existingRoom);
    const mockRoomRepository: RoomRepository = {
      save,
      findByCode,
    };

    const joinRoomInstance = new JoinRoom(mockRoomRepository);
    const input = { playerId: "player1", connectionId: "connection1", roomCode: "  abc123  " };
    await joinRoomInstance.execute(input);
    expect(findByCode).toHaveBeenCalledWith("ABC123");
  });

  it("should throw an error if the repository fails to save the room", async () => {
    const existingRoom = {
      id: "room1",
      code: "ABC123",
      ownerId: "owner1",
      players: [],
      createdAt: new Date(),
    };

    const repositoryError = new Error("Failed to save room");
    const mockRoomRepository: RoomRepository = {
      save: vi.fn().mockRejectedValue(repositoryError),
      findByCode: vi.fn().mockResolvedValue(existingRoom),
    };

    const joinRoomInstance = new JoinRoom(mockRoomRepository);
    const input = { playerId: "player1", connectionId: "connection1", roomCode: "ABC123" };

    await expect(joinRoomInstance.execute(input)).rejects.toBe(repositoryError);
  });
});
