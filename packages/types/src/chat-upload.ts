import type { ChatBaseResponse } from "./chat-base";

/** `POST /v1/upload`'s 201 body — the file is then referenced by `url` as a
 * message's `attachmentUrl`. */
export interface ChatUploadedFile {
  url: string;
  name: string;
  size: number;
  contentType: string;
}

export type ChatUploadResponse = ChatBaseResponse<ChatUploadedFile>;
