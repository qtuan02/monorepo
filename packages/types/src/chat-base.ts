/**
 * The envelope every `chat-socket` endpoint wraps its body in. Unlike the
 * rest of this workspace's backends (see .agents/rules/architecture-features-
 * modules.md, "there is no envelope on web"), this one genuinely has one —
 * so each `Chat*Service` method unwraps `.data` itself and still hands the
 * caller a plain `Promise<T>`.
 */
export interface ChatBaseResponse<T> {
  data: T;
  message: string | null;
  status: number;
}
