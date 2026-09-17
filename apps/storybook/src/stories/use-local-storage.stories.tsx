import type { Meta, StoryObj } from "@storybook/react";

import { useLocalStorage } from "@monorepo/hook/use-local-storage";
import { Button } from "@monorepo/ui/components/button";

import { northwindProjects } from "~/support/projects";

function Demo() {
  const [projectId, setProjectId] = useLocalStorage(
    "storybook-use-local-storage",
    northwindProjects[0]?.id,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {northwindProjects.map((project) => (
          <Button
            key={project.id}
            variant={project.id === projectId ? "default" : "outline"}
            onClick={() => setProjectId(project.id)}
          >
            {project.name}
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">
        Reload the page — the pick stays on <code>{projectId}</code>.
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useLocalStorage",
  component: Demo,
  tags: ["autodocs"],
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    stage: { width: "sm" },
  },
};
