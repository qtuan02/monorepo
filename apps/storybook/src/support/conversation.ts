export interface NorthwindConversationMessage {
  id: string;
  align: "start" | "end";
  text: string;
}

// The conversation's opener and its reply — named separately so a story that
// just needs the first exchange (message, bubble) can use them without
// indexing the array below.
export const conversationOpener: NorthwindConversationMessage = {
  id: "message-0",
  align: "start",
  text: "Hi Mira, I'm the Northwind Assistant. How can I help today?",
};

export const conversationReply: NorthwindConversationMessage = {
  id: "message-1",
  align: "end",
  text: "Can you pull up invoice INV-2041 for Atlas?",
};

// One Northwind Assistant ↔ Mira Okafor conversation about the Atlas
// invoice — shared by attachment/message/message-scroller/bubble/
// questionnaire so the AI/chat family stages one consistent scenario.
export const northwindConversation: NorthwindConversationMessage[] = [
  conversationOpener,
  conversationReply,
  {
    id: "message-2",
    align: "start",
    text: "Found it — INV-2041, $4,200, marked paid on Jun 1.",
  },
  {
    id: "message-3",
    align: "end",
    text: "Great, can you resend the receipt to finance@northwind.dev?",
  },
  { id: "message-4", align: "start", text: "Sending it over now." },
  {
    id: "message-5",
    align: "end",
    text: "Thanks! Also, when's the next Atlas billing cycle?",
  },
  {
    id: "message-6",
    align: "start",
    text: "The next cycle starts Jul 1, same as usual.",
  },
  {
    id: "message-7",
    align: "end",
    text: "Perfect. One more thing — has Tomás approved the Beacon invoice yet?",
  },
  {
    id: "message-8",
    align: "start",
    text: "Not yet, INV-2042 is still pending his review.",
  },
  { id: "message-9", align: "end", text: "Okay, I'll ping him directly." },
  {
    id: "message-10",
    align: "start",
    text: "Sounds good. Anything else I can help with?",
  },
  { id: "message-11", align: "end", text: "That's all for now, thanks!" },
];
