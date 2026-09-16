import { cn } from "@monorepo/ui/utils/cn";

interface BackdropProps {
  /**
   * `full` on the landing page: four aurora blobs and five shapes. `soft`
   * everywhere else: half the opacity, two shapes — the pages are text, and
   * the brief's own style row says aurora and prose do not mix.
   */
  intensity: "full" | "soft";
}

/**
 * The decoration behind every panel (glossary: *Backdrop*): four blurred
 * aurora blobs, five Bauhaus/Memphis shapes at low opacity, and a fade that
 * returns everything to the flat ground well before the first paragraph.
 * Static CSS — no keyframe, no `backdrop-filter` here; the glass is the
 * panels' job. Absolutely positioned at the top of the document so it scrolls
 * away with the hero, and `aria-hidden` because it says nothing.
 *
 * Colours are the five `--aurora-*` stops from `globals.css` rather than
 * palette classes, so the same five paint the swatches and the brand mark.
 */
export default function Backdrop({ intensity }: BackdropProps) {
  const soft = intensity === "soft";

  return (
    <div
      aria-hidden="true"
      data-intensity={intensity}
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[56rem] overflow-hidden",
        soft && "opacity-50",
      )}
    >
      {/* The aurora: each blob is a circle blurred past recognition. Halved in
          the dark theme, where the same stops would glow rather than tint. */}
      <div className="dark:opacity-50">
        <div className="bg-(--aurora-violet) absolute -top-40 -left-30 size-140 rounded-full opacity-75 blur-3xl" />
        <div className="bg-(--aurora-cyan) absolute -top-50 -right-20 size-130 rounded-full opacity-60 blur-3xl" />
        <div className="bg-(--aurora-pink) absolute top-30 left-[38%] size-105 rounded-full opacity-45 blur-3xl" />
        <div className="bg-(--aurora-amber) absolute top-105 right-[20%] size-95 rounded-full opacity-35 blur-3xl" />
      </div>

      {/* The shapes: ring, rotated square, triangle, dot grid, stripes. All
          five sit on the landing page; the soft variant keeps the ring and the
          dots, the two that read quietest. */}
      <div className="border-(--aurora-amber) absolute top-50 left-[6%] size-30 rounded-full border-14 opacity-90" />
      <div className="absolute top-130 right-[16%] h-20 w-35 bg-[radial-gradient(var(--aurora-indigo)_2.2px,transparent_2.4px)] bg-size-[14px_14px] opacity-50" />
      {!soft && (
        <>
          <div className="bg-(--aurora-pink) absolute top-37.5 right-[9%] size-22.5 rotate-[18deg] rounded-[14px] opacity-90" />
          <div className="bg-(--aurora-cyan) absolute top-140 left-[14%] h-26 w-30 -rotate-12 opacity-90 [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
          <div className="absolute top-20 right-[30%] h-6.5 w-40 -rotate-30 bg-[repeating-linear-gradient(90deg,var(--aurora-lime)_0_10px,transparent_10px_20px)] opacity-90" />
        </>
      )}

      {/* The fade to the flat ground, so no paragraph ever sits on colour. */}
      <div className="to-background absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-b from-transparent to-70%" />
    </div>
  );
}
