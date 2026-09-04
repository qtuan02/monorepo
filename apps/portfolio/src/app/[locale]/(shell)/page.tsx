import HomeTemplate from "~/features/home/templates/home.template";

/**
 * The one screen this site has.
 *
 * A thin route module in the fullest sense: the CV is a constant of the `home`
 * slice, not something fetched, so there is nothing to resolve here and no
 * page-level `generateMetadata` either — the title and description on the root
 * layout already describe this exact page, and a second copy of them would only
 * be one more place for them to drift.
 */
export default function HomePage() {
  return <HomeTemplate />;
}
