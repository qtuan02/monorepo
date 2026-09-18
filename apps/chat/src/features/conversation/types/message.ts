/** The UI's read of a `ChatMessageRecord` — see map-message-to-ui-model.ts. */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}
