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
  tags: ["autodocs"],
} satisfies Meta<typeof Attachment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Attachment className="max-w-xs">
      <AttachmentMedia variant="icon">
        <FileTextIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>report.pdf</AttachmentTitle>
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
  args: {},
  render: () => (
    <div className="flex flex-col gap-3">
      <Attachment state="idle" className="max-w-xs">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Drop a file here</AttachmentTitle>
          <AttachmentDescription>Waiting for upload</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="uploading" className="max-w-xs">
        <AttachmentMedia variant="icon">
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error" className="max-w-xs">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>Upload failed</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="done" className="max-w-xs">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>1.2 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  ),
};

export const Group: Story = {
  args: {},
  render: () => (
    <AttachmentGroup className="max-w-md">
      <Attachment orientation="vertical">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>invoice.pdf</AttachmentTitle>
          <AttachmentDescription>240 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment orientation="vertical">
        <AttachmentMedia variant="icon">
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>contract.pdf</AttachmentTitle>
          <AttachmentDescription>1.1 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  ),
};
