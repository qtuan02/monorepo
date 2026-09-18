import type { HttpClient } from "../client";

/**
 * `/health-check` sits outside `/v1` and carries no envelope — the source
 * `chat-socket-fe` only ever reads it for its 200, never its body.
 */
export class ChatHealthService {
  constructor(private client: HttpClient) {}

  async check(): Promise<void> {
    await this.client.get<unknown>("/health-check");
  }
}
