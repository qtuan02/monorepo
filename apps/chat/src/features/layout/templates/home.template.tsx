/**
 * The public surface `~/pages/home-page.tsx` renders — a page consumes a
 * slice through its template, never a slice's internal `components/`.
 * Placeholder until Conversation reading lands (#199).
 */
export default function HomeTemplate() {
  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-sm">
      No conversation selected yet.
    </div>
  );
}
