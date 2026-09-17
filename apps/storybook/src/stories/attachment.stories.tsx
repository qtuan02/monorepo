import type { Meta, StoryObj } from "@storybook/react";
import { FileTextIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@monorepo/ui/components/attachment";
import { Spinner } from "@monorepo/ui/components/spinner";

const meta = {
  title: "Storybook/Attachment",
  component: Attachment,
  subcomponents: {
    AttachmentMedia,
    AttachmentContent,
    AttachmentTitle,
    AttachmentDescription,
    AttachmentActions,
    AttachmentAction,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Attachment>;

export default meta;

type Story = StoryObj<typeof meta>;

// The Atlas invoice Mira asks the Northwind Assistant to resend — see
// message-scroller.stories.tsx for the conversation this attaches to.
export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Attachment>
      <AttachmentMedia variant="icon">
        <FileTextIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>invoice-INV-2041.pdf</AttachmentTitle>
        <AttachmentDescription>1.2 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Attachment state="idle">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Drop the receipt here</AttachmentTitle>
          <AttachmentDescription>Waiting for upload</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia variant="icon">
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>invoice-INV-2041.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>invoice-INV-2041.pdf</AttachmentTitle>
          <AttachmentDescription>Upload failed</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="done">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>invoice-INV-2041.pdf</AttachmentTitle>
          <AttachmentDescription>1.2 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AttachmentGroup className="max-w-md">
      <Attachment orientation="vertical">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>invoice-INV-2041.pdf</AttachmentTitle>
          <AttachmentDescription>240 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment orientation="vertical">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>atlas-contract.pdf</AttachmentTitle>
          <AttachmentDescription>1.1 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  ),
};
