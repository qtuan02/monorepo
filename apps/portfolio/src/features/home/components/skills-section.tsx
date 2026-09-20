import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import StandardBlock from "~/features/home/components/standard-block";
import { SKILL_GROUPS } from "~/features/home/constants/resume";

/**
 * Five labelled rows in one standard block, all of them visible at once — a
 * directory listing: `frontend/` down the left, what is in it to the right.
 *
 * Not tabs, which would hide four rows in five from the first read and from a
 * crawler entirely — a CV is read in one pass. The group label is the only
 * translated string here; the names on the right are product names and read
 * the same in both locales.
 *
 * The skills are text, not chips. v1 set them as a run of `Badge`s, and a chip
 * is a control-shaped thing that controls nothing: there is no filter to
 * activate. Set as monospace text they are the same thing the tech stack under
 * a work row is — a list of names — and at 14 px a dozen of them wrap at the
 * gaps like any text, where a dozen `whitespace-nowrap` badges were 12 px on a
 * phone and the first thing to crowd its edge.
 *
 * The trailing slash on a label is the terminal grammar and nothing more:
 * `aria-hidden`, so the heading's accessible name is the group, not
 * "Frontend slash", and a `getByRole("heading", { name })` matches the label
 * alone. One column on a phone, the label above its row; two from `sm`, the
 * label in a fixed gutter wide enough for "DevOps & CI/" in monospace; and one
 * again from `md`, where the block sits in the page's rail and a gutter would
 * leave the names too narrow a strip to wrap in, one or two to a line.
 */
export default function SkillsSection() {
  const t = useTranslations();

  return (
    <section id="skills">
      <div className="flex min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.skills.title")}</SectionHeading>
        <StandardBlock className="flex flex-col gap-y-3">
          {SKILL_GROUPS.map((group) => {
            const headingId = `skills-${group.id}`;

            return (
              <div
                key={group.id}
                className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[7.5rem_1fr] md:grid-cols-1"
              >
                <h3
                  id={headingId}
                  className="font-mono text-sm leading-relaxed font-semibold text-muted-foreground"
                >
                  {t(`portfolio.skills.groups.${group.id}`)}
                  <span aria-hidden="true">/</span>
                </h3>
                {/* Labelled by its own heading, so the row is announced as
                    "Frontend" rather than as a loose run of names. */}
                <ul
                  aria-labelledby={headingId}
                  className="flex list-none flex-wrap gap-x-2 gap-y-1 font-mono text-sm leading-relaxed"
                >
                  {group.skills.map((skill) => (
                    // A comma after each name but the last, drawn rather than
                    // typed: at one monospace space the gap between two names
                    // is the gap inside "Tailwind CSS", and the eye cannot tell
                    // where one skill ends. A pseudo-element keeps the text
                    // content, and so `getByText("React")`, unchanged.
                    <li
                      key={skill}
                      className="after:content-[','] last:after:content-none"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </StandardBlock>
      </div>
    </section>
  );
}
