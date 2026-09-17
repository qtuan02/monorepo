import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import StandardBlock from "~/features/home/components/standard-block";

/**
 * Two paragraphs of prose in one standard block, each its own message key
 * rather than an array.
 *
 * Sans, at the body floor, in the block's own ink: this is the one section
 * that is nothing but prose, and prose is what the sans half of the two
 * typefaces is for (`docs/design/portfolio-redesign-v2.md` §7, decision 2).
 * v1 set it in `text-muted-foreground`; inside a block that paints with
 * `text-foreground` the grey read as a lighter copy of the work bullets beside
 * it, so the paragraphs now take the ink the block gives them.
 */
export default function AboutSection() {
  const t = useTranslations();

  return (
    <section id="about">
      <div className="space-y-3">
        <SectionHeading>{t("portfolio.about.title")}</SectionHeading>
        <StandardBlock className="space-y-2 text-body leading-relaxed">
          <p>{t("portfolio.about.experience")}</p>
          <p>{t("portfolio.about.mindset")}</p>
        </StandardBlock>
      </div>
    </section>
  );
}
