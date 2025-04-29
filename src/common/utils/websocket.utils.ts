import { Socket } from "socket.io";

export class WebSocketUtils {
  static parseBody<T>(body: string): T {
    try {
      return JSON.parse(body);
    } catch {
      throw new Error('Invalid JSON format');
    }
  }

  static validateFields(
    data: Record<string, any>,
    requiredFields: string[],
  ): void {
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required field(s): ${missing.join(', ')}`);
    }
  }

  static safeEmit(client: Socket, event: string, payload: any) {
    try {
      if (client.connected) {
        client.emit(event, payload);
      }
    } catch (err) {
      console.error(`Failed to emit event "${event}": ${err.message}`);
    }
  }
}
