import { CodeBlock } from "~/components/code/code-block";
import { ImportSnippet } from "~/components/code/import-snippet";
import { GlassPanel } from "~/components/panel/glass-panel";
import { PanelHeading } from "./panel-heading";

interface DetailPanelsProps {
  exports: readonly string[];
  importPath: string;
  importHeading: string;
  exportsHeading: string;
  /** An optional third row spanning both columns: a code snippet under its heading. */
  example?: { heading: string; code: string };
}

/**
 * The body of a detail page: the import line to copy and the export list as
 * chips, side by side (`1.25fr | 1fr`) from `lg`, stacked below. Chips rather
 * than a table because a list of names has one column and nothing to compare —
 * a `<ul>` says exactly that. `example` lands as a third row spanning both
 * columns, so the grid's shape stays in this one file.
 */
export function DetailPanels({
  exports,
  importPath,
  importHeading,
  exportsHeading,
  example,
}: DetailPanelsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 pb-10 lg:grid-cols-[1.25fr_1fr]">
      <GlassPanel className="p-5 sm:p-6">
        <PanelHeading>{importHeading}</PanelHeading>
        <ImportSnippet exports={exports} importPath={importPath} />
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <PanelHeading>
          {exportsHeading} · {exports.length}
        </PanelHeading>
        <ul className="flex flex-wrap gap-2">
          {exports.map((name) => (
            // The export name is unique within its module — the stable key.
            <li
              key={name}
              className="bg-card border-primary/20 rounded-xl border px-3 py-1.5 font-mono text-[13px] shadow-(--sh-2)"
            >
              {name}
            </li>
          ))}
        </ul>
      </GlassPanel>

      {example && (
        <GlassPanel className="p-5 sm:p-6 lg:col-span-2">
          <PanelHeading>{example.heading}</PanelHeading>
          <CodeBlock code={example.code} />
        </GlassPanel>
      )}
    </div>
  );
}
