import type { Room } from "./room.js";

export interface RoomRepository {
  save(room: Room): Promise<void>;
  findByCode(code: string): Promise<Room | null>;
}
