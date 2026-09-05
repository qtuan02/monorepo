import FooterBuildInfo from "../components/footer/footer-build-info";
import FooterCopyright from "../components/footer/footer-copyright";

/**
 * The shell's closing bar. It is deliberately a single slim row rather than the
 * multi-column marketing footer: the only things worth the vertical space are
 * who owns the app and which build is running.
 */
export default function FooterTemplate() {
  return (
    // `mt-auto` is what pins it to the bottom on a short page — LayoutTemplate is
    // the flex column that makes that work.
    <footer className="border-border bg-card mt-auto border-t">
      {/* Padding must match HeaderTemplate and BodyTemplate exactly, or the
          footer's left/right edge drifts from the page content's. */}
      <div className="container mx-auto flex flex-col items-center gap-1 px-4 py-2 text-xs sm:h-9 sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:py-0 lg:px-8">
        <FooterCopyright />
        <FooterBuildInfo />
      </div>
    </footer>
  );
}
