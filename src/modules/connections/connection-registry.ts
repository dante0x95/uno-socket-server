import type { WebSocket } from "ws";

export class ConnectionRegistry {
  private readonly connections = new Map<string, WebSocket>();

  register(connectionId: string, socket: WebSocket): void {
    this.connections.set(connectionId, socket);
  }

  unregister(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  get(connectionId: string): WebSocket | undefined {
    return this.connections.get(connectionId);
  }
}
