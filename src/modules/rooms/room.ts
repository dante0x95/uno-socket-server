export interface RoomPlayer {
  id: string;
  connectionId: string;
}

export interface Room {
  id: string;
  code: string;
  ownerId: string;
  players: RoomPlayer[];
  createdAt: Date;
}
