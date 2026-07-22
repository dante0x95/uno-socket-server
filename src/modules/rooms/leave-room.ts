import type { Room } from "./room.js";
import type { RoomRepository } from "./room.repository.js";

interface LeaveRoomInput {
  roomCode: string;
  playerId: string;
}

interface LeaveRoomOutput {
  room: Room;
}

export class LeaveRoom {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(input: LeaveRoomInput): Promise<LeaveRoomOutput> {
    const roomCode = input.roomCode.trim().toUpperCase();
    const room = await this.roomRepository.findByCode(roomCode);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const playersIsInRoom = room.players.some(
      (player) => player.id === input.playerId,
    );

    if (!playersIsInRoom) {
      throw new Error("PLAYER_NOT_FOUND");
    }

    const ownerIsLeaving = room.ownerId === input.playerId;

    room.players = room.players.filter(
      (player) => player.id !== input.playerId,
    );

    const newOwnerId = room.players[0];

    if (room.players.length < 2) {
      await this.roomRepository.deleteByCode(room.code);
      return { room };
    }
    if (ownerIsLeaving && newOwnerId) {
      room.ownerId = newOwnerId.id;
    }

    await this.roomRepository.save(room);

    return { room };
  }
}
