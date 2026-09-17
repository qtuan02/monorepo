import { GlassPanel } from "~/components/panel/glass-panel";
import { env } from "~/env";
import { useTheme } from "~/libs/theme-provider";
import { PanelHeading } from "./panel-heading";

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
 * two cannot drift. `&globals=theme:dark` follows the reader's own theme —
 * light appends nothing, Storybook's own default — so the stage panel around
 * it is the only frame on screen; the iframe carries no border or fill of its
 * own.
 */
export function DetailExample({ heading, title, storyId }: DetailExampleProps) {
  const { resolvedTheme } = useTheme();
  const themeParam = resolvedTheme === "dark" ? "&globals=theme:dark" : "";
  const src = `${env.PUBLIC_DOCUMENTS_STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story${themeParam}`;

  return (
    <GlassPanel className="mb-4 p-5 sm:p-6">
      <PanelHeading>{heading}</PanelHeading>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="h-80 w-full rounded-xl sm:h-96"
      />
    </GlassPanel>
  );
}
