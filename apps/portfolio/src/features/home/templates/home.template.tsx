import AboutSection from "~/features/home/components/about-section";
import ContactSection from "~/features/home/components/contact-section";
import EducationSection from "~/features/home/components/education-section";
import HeroSection from "~/features/home/components/hero-section";
import HobbiesSection from "~/features/home/components/hobbies-section";
import ProjectsSection from "~/features/home/components/projects-section";
import SkillsSection from "~/features/home/components/skills-section";
import WorkSection from "~/features/home/components/work-section";

/**
 * The whole CV, in reading order.
 *
 * A Server Component with no props: the content is a constant of the slice, not
 * something a route module fetches, so there is nothing for the page to hand
 * down (see `~/features/home/constants/resume.ts` for why it is not a
 * `"use cache"` read). Every section renders on the server and arrives at
 * rest — there is no entrance animation, so nothing here is staggered; the only
 * client islands left are the expandable work rows, the print button and the
 * hero's `Avatar`.
 */
export default function HomeTemplate() {
  return (
    <div className="flex flex-col space-y-6 md:space-y-10">
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <ProjectsSection />
      {/* Skills before Education: a recruiter reading this CV wants the stack
          before the degree, and the design brief's reading order (§2) says so.
          The two arrived from two tickets running in parallel and landed the
          other way round — `test/features/home/templates/home.template.test.tsx`
          is what stops that happening again. */}
      <SkillsSection />
      <EducationSection />
      {/* Stacked on a phone, two columns from `sm` with contact given the wider
          one — side by side at 375 px an email address has nowhere to go but
          out of the viewport. */}
      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <ContactSection />
        <HobbiesSection />
      </div>
    </div>
  );
}
