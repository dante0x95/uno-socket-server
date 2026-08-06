import { describe, expect, it, vi } from "vitest";

import { LeaveRoom } from "./leave-room.js";

import type { Room } from "./room.js";
import type { RoomRepository } from "./room.repository.js";

describe("LeaveRoom", () => {
  it("should remove the player from the room and save the updated room", async () => {
    const room: Room = {
      id: "room-id",
      code: "ROOMCODE",
      ownerId: "owner-id",
      players: [
        { id: "player1", connectionId: "conn1" },
        { id: "player2", connectionId: "conn2" },
        { id: "player3", connectionId: "conn3" },
      ],
      createdAt: new Date(),
    };

    const saveMock = vi.fn();
    const findByCodeMock = vi.fn().mockResolvedValue(room);

    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: vi.fn(),
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    const input = {
      roomCode: "ROOMCODE",
      playerId: "player1",
    };

    const result = await leaveRoom.execute(input);

    expect(findByCodeMock).toHaveBeenCalledWith("ROOMCODE");
    expect(saveMock).toHaveBeenCalledWith({
      ...room,
      players: [{ id: "player2", connectionId: "conn2" }, { id: "player3", connectionId: "conn3" }],
    });
    expect(result.status).toBe("updated");

    expect(result.room.players).toEqual([{ id: "player2", connectionId: "conn2" }, { id: "player3", connectionId: "conn3" }]);
  });

  it("throws PLAYER_NOT_FOUND error if the player is not in the room", async () => {
    const room: Room = {
      id: "room-id",
      code: "ROOMCODE",
      ownerId: "owner-id",
      players: [{ id: "player2", connectionId: "conn2" }],
      createdAt: new Date(),
    };

    const findByCodeMock = vi.fn().mockResolvedValue(room);
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: vi.fn(),
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    const input = {
      roomCode: "ROOMCODE",
      playerId: "player1",
    };

    await expect(leaveRoom.execute(input)).rejects.toThrowError("PLAYER_NOT_FOUND");
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("throws ROOM_NOT_FOUND error if the room does not exist", async () => {
    const findByCodeMock = vi.fn().mockResolvedValue(undefined);
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: vi.fn(),
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    const input = {
      roomCode: "ROOMCODE",
      playerId: "player1",
    };

    await expect(leaveRoom.execute(input)).rejects.toThrow("ROOM_NOT_FOUND");
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("should handle case-insensitive room codes", async () => {
    const room: Room = {
      id: "room-id",
      code: "ROOMCODE",
      ownerId: "owner-id",
      players: [
        { id: "player1", connectionId: "conn1" },
        { id: "player2", connectionId: "conn2" },
      ],
      createdAt: new Date(),
    };

    const saveMock = vi.fn();
    const findByCodeMock = vi.fn().mockResolvedValue(room);

    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: vi.fn(),
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    const input = {
      roomCode: "roomcode", // Lowercase input
      playerId: "player1",
    };

    const result = await leaveRoom.execute(input);

    expect(findByCodeMock).toHaveBeenCalledWith("ROOMCODE");
    expect(result.room.players).toEqual([{ id: "player2", connectionId: "conn2" }]);
  });

  it("transfers ownership if the owner leaves the room", async () => {
    const room: Room = {
      id: "room-id",
      code: "ROOMCODE",
      ownerId: "owner-id",
      players: [
        { id: "owner-id", connectionId: "conn1" },
        { id: "player2", connectionId: "conn2" },
        { id: "player3", connectionId: "conn3" },
      ],
      createdAt: new Date(),
    };

    const saveMock = vi.fn();
    const findByCodeMock = vi.fn().mockResolvedValue(room);

    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: vi.fn(),
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    const input = {
      roomCode: "ROOMCODE",
      playerId: "owner-id",
    };

    const result = await leaveRoom.execute(input);

    expect(findByCodeMock).toHaveBeenCalledWith("ROOMCODE");
    expect(result.room.ownerId).toBe("player2");
    expect(result.room.players).toEqual([{ id: "player2", connectionId: "conn2" }, { id: "player3", connectionId: "conn3" }]);
  });

  it("deletes the room when only one player remains", async () => {
    const room: Room = {
      id: "room-id",
      code: "ROOMCODE",
      ownerId: "owner-id",
      players: [
        { id: "owner-id", connectionId: "conn1" },
        { id: "player2", connectionId: "conn2" },
      ],
      createdAt: new Date(),
    };

    const saveMock = vi.fn();
    const deleteByCodeMock = vi.fn();
    const findByCodeMock = vi.fn().mockResolvedValue(room);

    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: deleteByCodeMock,
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    await leaveRoom.execute({
      roomCode: "ROOMCODE",
      playerId: "owner-id",
    });

    expect(deleteByCodeMock).toHaveBeenCalledOnce();
    expect(deleteByCodeMock).toHaveBeenCalledWith("ROOMCODE");
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("keeps and saves the room when two players remain", async () => {
    const room: Room = {
      id: "room-id",
      code: "ROOMCODE",
      ownerId: "owner-id",
      players: [
        { id: "owner-id", connectionId: "conn1" },
        { id: "player2", connectionId: "conn2" },
        { id: "player3", connectionId: "conn3" },
      ],
      createdAt: new Date(),
    };

    const saveMock = vi.fn();
    const deleteByCodeMock = vi.fn();
    const findByCodeMock = vi.fn().mockResolvedValue(room);

    const roomRepository: RoomRepository = {
      save: saveMock,
      findByCode: findByCodeMock,
      deleteByCode: deleteByCodeMock,
    };

    const leaveRoom = new LeaveRoom(roomRepository);

    const result = await leaveRoom.execute({
      roomCode: "ROOMCODE",
      playerId: "player3",
    });

    expect(result.room.players).toEqual([
      { id: "owner-id", connectionId: "conn1" },
      { id: "player2", connectionId: "conn2" },
    ]);
    expect(result.status).toBe("updated");
    expect(result.status).toBe("updated");
    expect(result.playerId).toBe("player3");

    expect(saveMock).toHaveBeenCalledWith(room);
    expect(deleteByCodeMock).not.toHaveBeenCalled();
  });
});
