import { randomUUID } from "node:crypto";

import type { Room } from "./room.js";
import type { RoomRepository } from "./room.repository.js";

interface CreateRoomInput {
  playerId: string;
  connectionId: string;
}

interface CreateRoomOutput {
  room: Room;
}

export class CreateRoom {
  constructor(private readonly roomRepository: RoomRepository) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomOutput> {
    const room: Room = {
      id: randomUUID(),
      code: this.generateCode(),
      ownerId: input.playerId,
      players: [
        {
          id: input.playerId,
          connectionId: input.connectionId,
        },
      ],
      createdAt: new Date(),
    };

    await this.roomRepository.save(room);

    return { room };
  }

  private generateCode(): string {
    return randomUUID().slice(0, 6).toUpperCase();
  }
}
