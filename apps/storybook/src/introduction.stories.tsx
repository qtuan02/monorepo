import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Introduction",
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
              <strong className="text-foreground">sidebar</strong> —
              Introduction, then Storybook (the primitives), then Hooks.
            </li>
            <li>
              → Every story sits inside a{" "}
              <strong className="text-foreground">stage</strong> — the same
              panel <code>documents</code> shows in its iframe. Toggle{" "}
              <strong className="text-foreground">light / dark</strong> from the
              toolbar; a portalled overlay (Dialog, Popover, Tooltip, Toast)
              follows it too.
            </li>
            <li>
              → The <strong className="text-foreground">Docs</strong> tab is
              generated from the component's props.
            </li>
            <li>
              → On a leaf primitive (Button, Badge, Input, Switch…) the{" "}
              <strong className="text-foreground">Controls</strong> tab edits{" "}
              <code>Default</code>'s props live. A compound primitive (Dialog,
              Select, Card…) keeps Controls off <code>Default</code> and lists
              its anatomy as subcomponents instead.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Story names</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            <code>Default</code> is the story every component ships — and the
            one <code>documents</code> embeds. <code>Variants</code>,{" "}
            <code>Sizes</code>, <code>States</code>, <code>Orientation</code>{" "}
            and <code>Stacking</code> show up only where the component has that
            axis: a <code>cva</code> variant, a size scale, a disabled/invalid
            state, a direction, or an overlay stacking above the page. A story
            built out of several primitives keeps its own descriptive name
            instead.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Northwind</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every story's copy comes from the same made-up team workspace —
            Northwind, at <code>northwind.dev</code>: eight people, four
            projects (Atlas, Beacon, Comet, Delta), a handful of invoices and
            notifications. The fixtures live in <code>src/support/</code>, one
            named export per entity, so a new story imports the same cast every
            other story does instead of writing its own placeholder copy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">What this workshop is for</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            jsdom lays nothing out, so the unit suite cannot see a slider that
            lost its height or a tabs list that stretched. Those failures are
            visual and only show up here — check orientation on Slider, Tabs,
            ScrollArea and Separator, and check that Dialog, Popover and Tooltip
            render above the page rather than behind it, in both themes.
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
