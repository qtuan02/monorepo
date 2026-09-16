/**
 * The palette the share card is drawn with — the app's **light** theme, spelled
 * out. Satori cannot read a CSS custom property, so every colour here is a
 * literal, and each one is the sRGB the matching `oklch()` in `src/globals.css`
 * (or, for the two the app does not override, `theme.css`) resolves to.
 * `test/features/home/components/open-graph-card.test.tsx` reads both
 * stylesheets and holds each literal to its token, so the card cannot drift
 * from the page it is a preview of. Each key names the token it mirrors,
 * except `ink`, which stands for the three that share one value.
 *
 * Only the light theme: a link unfurler has no `prefers-color-scheme`, and a
 * card that matched one reader's dark mode would be inverted for the other.
 */
export const OPEN_GRAPH_PALETTE = {
  /** `--background` — the theme's page ground, white like the card */
  background: "#ffffff",
  /** `--card` — the block is a white card, as every card on the page is */
  card: "#ffffff",
  /** `--foreground`, `--border` and `--hard-shadow` — one ink for all three */
  ink: "#0a0a0a",
  /** `--highlight` — the one yellow slab */
  highlight: "#ffe14d",
  /** `--primary` — indigo, for the secondary details only */
  primary: "#4f39f6",
} as const;

/**
 * The hard edge every block on the page has, at the card's scale. The page
 * draws `border-2` and a `4px 4px 0` shadow at CSS-pixel size; a 1200×630
 * image is read scaled down to a chat thumbnail, so both are thicker here or
 * neither survives the downscale.
 */
const EDGE = 4;
const SHADOW = 12;

interface OpenGraphCardProps {
  title: string;
  positioning: string;
  host: string;
}

/**
 * The 1200×630 share card, as the element tree `ImageResponse` rasterises.
 *
 * It is the hero's terminal block redrawn in the same grammar — one white
 * block on the page ground with a hard ink border and a solid offset shadow, a
 * title bar with three squares and the host where a window title goes, then
 * the `$ whoami` prompt, the name on a yellow slab and the positioning line.
 * Square everywhere: nothing here declares a radius, and the test pins that.
 *
 * Inline `style`, not `className`: Satori lays out from the style object and
 * never sees the app's stylesheet — this is not the DOM the Tailwind rule is
 * about. Every element with more than one child is `display: flex`, because
 * Satori supports no other layout. And the prompt is code, so it stays English
 * in both locales like the hero's — only the two catalogue strings are handed in.
 */
export default function OpenGraphCard({
  title,
  positioning,
  host,
}: OpenGraphCardProps) {
  const { background, card, ink, highlight, primary } = OPEN_GRAPH_PALETTE;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        // Room on the right and below for the shadow, which is drawn outside
        // the block's box.
        padding: `56px ${56 + SHADOW}px ${56 + SHADOW}px 56px`,
        background,
        color: ink,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: card,
          border: `${EDGE}px solid ${ink}`,
          boxShadow: `${SHADOW}px ${SHADOW}px 0 ${ink}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 28px",
            borderBottom: `${EDGE}px solid ${ink}`,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 16, height: 16, background: ink }} />
            <div style={{ width: 16, height: 16, background: ink }} />
            <div style={{ width: 16, height: 16, background: ink }} />
          </div>
          <div style={{ fontSize: 28, color: primary }}>{host}</div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 56px",
          }}
        >
          <div style={{ fontSize: 30, color: primary }}>$ whoami</div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 14,
              padding: "6px 22px",
              fontSize: 82,
              lineHeight: 1.1,
              letterSpacing: -2,
              background: highlight,
              color: ink,
            }}
          >
            {title}
          </div>
          <div
            style={{
              maxWidth: 960,
              marginTop: 32,
              fontSize: 38,
              lineHeight: 1.35,
            }}
          >
            {positioning}
          </div>
        </div>
      </div>
    </div>
  );
}
