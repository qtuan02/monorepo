import { GlassPanel } from "~/components/panel/glass-panel";
import { env } from "~/env";

interface DetailExampleProps {
  /** The heading — "Ví dụ". */
  heading: string;
  /** The accessible name of the frame — "Ví dụ button trên Storybook". */
  title: string;
  /** The story id the generator derived — `storybook-button--default`. */
  storyId: string;
}

/**
 * The live example on a primitive's page: the deployed Storybook rendering
 * that primitive's `Default` story, through the preview iframe Storybook
 * serves on its own (`iframe.html?id=…&viewMode=story`) — the story alone,
 * no sidebar, no addons panel. Nothing is hand-written here: the story is the
 * example, so a primitive gets one the moment its story file exists, and the
 * two cannot drift. The frame stays light in dark mode — the Storybook
 * preview has no theme switch to hand a `.dark` class to.
 */
export function DetailExample({ heading, title, storyId }: DetailExampleProps) {
  const src = `${env.PUBLIC_DOCUMENTS_STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`;

  return (
    <GlassPanel className="mb-4 p-5 sm:p-6">
      <h2 className="text-primary mb-3.5 font-mono text-xs font-semibold tracking-wider uppercase">
        {heading}
      </h2>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="border-primary/20 bg-card h-80 w-full rounded-xl border sm:h-96"
      />
    </GlassPanel>
  );
}
