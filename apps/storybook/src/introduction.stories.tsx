import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Storybook/Introduction",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const stack = [
  "React 19",
  "Base UI",
  "Tailwind v4",
  "Vite 8",
  "Storybook 10",
  "Bun workspaces",
];

function IntroductionContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            @monorepo/ui
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            The component workshop
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Every primitive shared across this monorepo, rendered in isolation.
            One story file per component, on the shadcn <code>base-vega</code>{" "}
            style over Base UI — so a change here is visible before it reaches
            an app.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-semibold">Getting around</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              → Pick a component from the{" "}
              <strong className="text-foreground">sidebar</strong> on the left.
            </li>
            <li>
              → The <strong className="text-foreground">Docs</strong> tab is
              generated from the component's props.
            </li>
            <li>
              → The <strong className="text-foreground">Controls</strong> tab
              edits those props live.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">What this workshop is for</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            jsdom lays nothing out, so the unit suite cannot see a slider that
            lost its height or a tabs list that stretched. Those failures are
            visual and only show up here — check orientation on Slider, Tabs,
            ScrollArea and Separator, and check that Dialog, Popover and Tooltip
            render above the page rather than behind it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Stack</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export const Welcome: Story = {
  render: () => <IntroductionContent />,
};
