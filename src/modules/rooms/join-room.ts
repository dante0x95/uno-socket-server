import type { Room } from "./room.js";
import type { RoomRepository } from "./room.repository.js";

interface JoinRoomInput {
  roomCode: string;
  playerId: string;
  connectionId: string;
}

interface JoinRoomOutput {
  room: Room;
}

export class JoinRoom {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomOutput> {
    const roomCode = input.roomCode.trim().toUpperCase();
    const room = await this.roomRepository.findByCode(roomCode);

    if (!room) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const playerAlreadyJoined = room.players.some(
      (player) => player.id === input.playerId,
    );

    if (playerAlreadyJoined) {
      throw new Error("PLAYER_ALREADY_JOINED");
    }

    room.players.push({
      id: input.playerId,
      connectionId: input.connectionId,
    });

    await this.roomRepository.save(room);

    return { room };
  }
}
