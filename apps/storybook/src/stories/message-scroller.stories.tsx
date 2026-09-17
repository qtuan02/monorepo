import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback } from "@monorepo/ui/components/avatar";
import { Bubble, BubbleContent } from "@monorepo/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@monorepo/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@monorepo/ui/components/message-scroller";

const meta = {
  title: "Storybook/MessageScroller",
  component: MessageScroller,
  subcomponents: {
    MessageScrollerProvider,
    MessageScrollerViewport,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerButton,
  },
  tags: ["autodocs"],
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof MessageScroller>;

export default meta;

type Story = StoryObj<typeof meta>;

// One Northwind Assistant ↔ Mira Okafor conversation about the Atlas invoice —
// the same scenario attachment/message/bubble/questionnaire stage around it.
const northwindConversation = [
  {
    align: "start" as const,
    text: "Hi Mira, I'm the Northwind Assistant. How can I help today?",
  },
  {
    align: "end" as const,
    text: "Can you pull up invoice INV-2041 for Atlas?",
  },
  {
    align: "start" as const,
    text: "Found it — INV-2041, $4,200, marked paid on Jun 1.",
  },
  {
    align: "end" as const,
    text: "Great, can you resend the receipt to finance@northwind.dev?",
  },
  { align: "start" as const, text: "Sending it over now." },
  {
    align: "end" as const,
    text: "Thanks! Also, when's the next Atlas billing cycle?",
  },
  {
    align: "start" as const,
    text: "The next cycle starts Jul 1, same as usual.",
  },
  {
    align: "end" as const,
    text: "Perfect. One more thing — has Tomás approved the Beacon invoice yet?",
  },
  {
    align: "start" as const,
    text: "Not yet, INV-2042 is still pending his review.",
  },
  { align: "end" as const, text: "Okay, I'll ping him directly." },
  {
    align: "start" as const,
    text: "Sounds good. Anything else I can help with?",
  },
  { align: "end" as const, text: "That's all for now, thanks!" },
].map((message, index) => ({ id: `message-${index}`, ...message }));

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <MessageScrollerProvider>
      <MessageScroller className="h-72 w-full rounded-lg border">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {northwindConversation.map((message) => (
              <MessageScrollerItem key={message.id} messageId={message.id}>
                <Message align={message.align}>
                  {message.align === "start" && (
                    <MessageAvatar>
                      <Avatar size="sm">
                        <AvatarFallback>NA</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                  )}
                  <MessageContent>
                    <Bubble
                      align={message.align}
                      variant={message.align === "start" ? "muted" : "default"}
                    >
                      <BubbleContent>{message.text}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton direction="end" />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};
