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
 *
 * Two columns from `md`, one below it, and the DOM is the same in both: the
 * hero across the top, then everything a reader scans first — About, the work
 * history, the projects — in the read column, with the reference material —
 * skills, degree, contact, hobbies — in a rail that stays in view while the
 * long column scrolls. The ratio itself changes once more, at `lg`: 3/2 on a
 * tablet (a 768 px well gives a ~424 px read column, still readable, where a
 * single column ran prose ~100 characters wide) and 2/1 from there, unchanged
 * from v2. That is also exactly the section order
 * `test/features/home/templates/home.template.test.tsx` pins: the left group
 * *is* sections two to four and the rail *is* five to eight, so nothing is
 * visually reordered and a screen reader, a keyboard and a phone all read the
 * page in the order it is written. The rail is `self-start` so it sticks by
 * its own height rather than stretching to the column's, and `min-w-0` on
 * both tracks lets a long token wrap instead of widening a track.
 */
export default function HomeTemplate() {
  return (
    <div className="flex flex-col space-y-6 md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-x-8 md:gap-y-0 md:space-y-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-10">
      <div className="md:col-span-2 md:mb-8 lg:mb-10">
        <HeroSection />
      </div>

      <div className="flex min-w-0 flex-col space-y-6 md:space-y-10">
        <AboutSection />
        <WorkSection />
        <ProjectsSection />
      </div>

      {/* Skills before Education: a recruiter reading this CV wants the stack
          before the degree, and the design brief's reading order (§2) says so.
          The two arrived from two tickets running in parallel and landed the
          other way round — `test/features/home/templates/home.template.test.tsx`
          is what stops that happening again. */}
      <aside className="flex min-w-0 flex-col space-y-6 md:space-y-10 md:sticky md:top-6 md:self-start">
        <SkillsSection />
        <EducationSection />
        {/* Stacked on a phone, two columns from `sm` with contact given the
            wider one — side by side at 375 px an email address has nowhere to
            go but out of the viewport — and stacked again from `md`, where the
            rail is narrow enough (264 px at 768) that a two-column row has no
            room left for either field. */}
        <div className="grid gap-6 sm:grid-cols-[2fr_1fr] md:grid-cols-1">
          <ContactSection />
          <HobbiesSection />
        </div>
      </aside>
    </div>
  );
}
