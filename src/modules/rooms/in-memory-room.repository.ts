import type { Room } from "./room.js";
import type { RoomRepository } from "./room.repository.js";

export class InMemoryRoomRepository implements RoomRepository {
  private readonly roomsByCode = new Map<string, Room>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async save(room: Room): Promise<void> {
    this.roomsByCode.set(room.code, structuredClone(room));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByCode(code: string): Promise<Room | null> {
    const room = this.roomsByCode.get(code);

    return room ? structuredClone(room) : null;
  }
}
