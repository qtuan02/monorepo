import type { Meta, StoryObj } from "@storybook/react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@monorepo/ui/components/resizable";

const meta = {
  title: "Storybook/Resizable",
  component: ResizablePanelGroup,
  subcomponents: { ResizablePanel, ResizableHandle },
  tags: ["autodocs"],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// react-resizable-panels sets its own inline `height: 100%` on the group, which always
// wins over a Tailwind `h-*` className — the group needs a real height in its `style` prop
// (not className) to resolve against, or a vertical group collapses to 0.
export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      style={{ height: 192 }}
      className="w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Projects</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Atlas</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const Orientation: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="vertical"
      style={{ height: 256 }}
      className="w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Northwind</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Atlas timeline</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ThreePanels: Story = {
  parameters: { stage: { width: "lg" } },
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      style={{ height: 192 }}
      className="w-full rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Projects</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Atlas</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Activity</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
