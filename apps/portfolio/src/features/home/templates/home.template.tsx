import AboutSection from "~/features/home/components/about-section";
import ContactSection from "~/features/home/components/contact-section";
import EducationSection from "~/features/home/components/education-section";
import HeroSection from "~/features/home/components/hero-section";
import HobbiesSection from "~/features/home/components/hobbies-section";
import SkillsSection from "~/features/home/components/skills-section";
import WorkSection from "~/features/home/components/work-section";

/**
 * The whole CV, in reading order.
 *
 * A Server Component with no props: the content is a constant of the slice, not
 * something a route module fetches, so there is nothing for the page to hand
 * down (see `~/features/home/constants/resume.ts` for why it is not a
 * `"use cache"` read). Every section renders on the server; only the fades, the
 * lens and the expandable rows are client islands.
 *
 * The delays are the staggering the sections arrive with, expressed once here so
 * a section's place in the sequence is visible in one list instead of being a
 * multiplier buried in seven files.
 */
const SECTION_DELAY = 0.08;

export default function HomeTemplate() {
  return (
    <div className="flex flex-col space-y-6 md:space-y-10">
      <HeroSection delay={SECTION_DELAY} />
      <AboutSection delay={SECTION_DELAY * 3} />
      <WorkSection delay={SECTION_DELAY * 5} />
      <EducationSection delay={SECTION_DELAY * 7} />
      <SkillsSection delay={SECTION_DELAY * 9} />
      <div className="flex gap-6">
        <ContactSection delay={SECTION_DELAY * 9} />
        <HobbiesSection delay={SECTION_DELAY * 9} />
      </div>
    </div>
  );
}
