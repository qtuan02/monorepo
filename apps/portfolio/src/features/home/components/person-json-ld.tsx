import { useLocale, useTranslations } from "next-intl";

import avatar from "~/assets/avatar.jpg";
import { PROFILE_LINKS } from "~/constants/profile";
import { ROUTES } from "~/constants/routes";
import {
  EDUCATION_ITEMS,
  SKILL_GROUPS,
} from "~/features/home/constants/resume";
import { absoluteUrl } from "~/utils/absolute-url";

/**
 * The page's `Person` structured data — the half of SEO that `<meta>` tags
 * cannot express.
 *
 * A title and a description tell a crawler what a page *says*; schema.org tells
 * it what the page *is about*. For a CV that is the difference between a blue
 * link and an entity a search engine can attach a job title, a location, an
 * employer history and two social profiles to — which is also what feeds a
 * knowledge panel and the "people also search for" row.
 *
 * Every value is read from the same source the visible page renders from: the
 * catalogue for the prose, `~/constants/profile` for the links, the slice's own
 * constants for the skills and the degree. Nothing here is a second copy of a
 * string a reader sees, so the markup cannot claim something the page does not.
 *
 * A Server Component with no props: it renders one `<script>` into the static
 * shell, ships no JavaScript, and is invisible to a reader. `useLocale` rather
 * than an awaited `params` — the URL it points at has to be the one *this*
 * locale serves, or the canonical and the entity disagree.
 */
export default function PersonJsonLd() {
  const t = useTranslations();
  const locale = useLocale();

  const name = t("portfolio.hero.name");
  const url = absoluteUrl(locale, ROUTES.HOME);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    jobTitle: t("portfolio.hero.role"),
    description: t("portfolio.meta.description"),
    image: new URL(avatar.src, url).toString(),
    email: t("portfolio.contact.items.email"),
    telephone: t("portfolio.contact.items.phone"),
    address: {
      "@type": "PostalAddress",
      addressLocality: t("portfolio.contact.items.location"),
      addressCountry: "VN",
    },
    // The two profiles a recruiter verifies against, and the two `sameAs` is
    // actually read for.
    sameAs: [PROFILE_LINKS.github, PROFILE_LINKS.linkedin],
    alumniOf: EDUCATION_ITEMS.map((item) => ({
      "@type": "CollegeOrUniversity",
      name: item.school,
      url: item.href,
    })),
    knowsAbout: SKILL_GROUPS.flatMap((group) => group.skills),
  };

  return (
    // `JSON.stringify` of an object built here — never an interpolated string:
    // the stringifier escapes what would otherwise let a value close the tag.
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit a JSON-LD body — the content is serialized by JSON.stringify, never interpolated
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
    />
  );
}
