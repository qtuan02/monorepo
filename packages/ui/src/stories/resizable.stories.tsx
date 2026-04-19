import type { Meta, StoryObj } from "@storybook/react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/resizable";

const meta = {
  title: "UI/Resizable",
  component: ResizablePanelGroup,
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {} as Story["args"],
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex h-32 items-center justify-center p-4 text-sm">
          A
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex h-32 items-center justify-center p-4 text-sm">
          B
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Vertical: Story = {
  args: {} as Story["args"],
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={40} minSize={15}>
        <div className="flex items-center justify-center p-4 text-sm">Top</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} minSize={15}>
        <div className="flex items-center justify-center p-4 text-sm">
          Bottom
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
