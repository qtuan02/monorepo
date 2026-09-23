import PersonJsonLd from "~/features/home/components/person-json-ld";
import HomeTemplate from "~/features/home/templates/home.template";

/**
 * The one screen this site has.
 *
 * A thin route module in the fullest sense: the CV is a constant of the `home`
 * slice, not something fetched, so there is nothing to resolve here and no
 * page-level `generateMetadata` either — the title and description on the root
 * layout already describe this exact page, and a second copy of them would only
 * be one more place for them to drift.
 *
 * The `Person` structured data sits beside the template rather than inside it:
 * it renders no pixels, it describes *this URL* rather than the CV's layout,
 * and a template that emitted a `<script>` could not be reused anywhere else.
 */
export default function HomePage() {
  return (
    <>
      <PersonJsonLd />
      <HomeTemplate />
    </>
  );
}
