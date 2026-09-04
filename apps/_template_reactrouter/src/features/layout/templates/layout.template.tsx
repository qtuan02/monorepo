import BodyTemplate from "./body.template";
import FooterTemplate from "./footer.template";
import HeaderTemplate from "./header.template";

/**
 * The app shell, and the public surface of the `layout` slice: what the layout
 * route module renders around every page beneath it.
 *
 * Unlike the Vite Template's version this sets no `document.title` from an
 * effect. A title written after hydration does not exist for a crawler, which is
 * the one property this Runtime is chosen for — the tab belongs to each route's
 * `meta` export, which runs on the server.
 */
export default function LayoutTemplate() {
  return (
    // A full-height flex column so the footer's `mt-auto` reaches the bottom of
    // the viewport on a short page instead of riding up under the content.
    <div className="flex min-h-dvh flex-col">
      <HeaderTemplate />
      <BodyTemplate />
      <FooterTemplate />
    </div>
  );
}
