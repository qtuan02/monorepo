import type { StaticImageData } from "next/image";

import type { IconComponent } from "~/types/icon";

/**
 * One row of the work history.
 *
 * The split runs down the middle of the CV: **structure** lives here (order,
 * ids, logos, tech stack, which bullets a role has) and every **string a reader
 * sees** lives in `@monorepo/i18n` under `portfolio.*`. `company` stays here
 * because a company name is a proper noun — it reads the same in both locales —
 * and so does `techStack`, which is a list of product names.
 */
export interface WorkItem {
  /** Also the message-key segment: `portfolio.work.items.<id>.role`. */
  id: string;
  company: string;
  logo: StaticImageData;
  techStack: readonly string[];
  /** Message-key segments under `portfolio.work.items.<id>.bullets`. */
  bulletKeys: readonly string[];
  /**
   * The prize this role's row wears a badge for, named by the message-key
   * segment under `portfolio.work.items.<id>.awards` — which holds the badge's
   * short `label` and the `tooltip` spelling the award out in full. Absent on
   * every row that has not won one, which is most of them.
   *
   * Naming the award rather than flagging it with a boolean is what keeps the
   * field worth reading: `arobid` earned one prize in 2025, and the constants
   * say which.
   */
  award?: string;
}

/**
 * Which half of a project a source link points at. A full-stack project keeps
 * two repositories, and a recruiter reading the card has to be able to tell
 * the frontend one from the backend one before opening either — so the id is
 * also what picks the link's label (see `PROJECT_SOURCE_LABEL_KEYS`).
 */
export type ProjectSourceId = "repo" | "frontend" | "backend";

/** One repository link of a project. */
export interface ProjectSource {
  id: ProjectSourceId;
  href: string;
}

/**
 * One personal-project card. The same split as `WorkItem`: structure here,
 * every reader-facing string in the catalogue under `portfolio.projects`.
 * `name` stays here because a project name is a proper noun, and `techStack`
 * because it is a list of product names. There is deliberately no image: a
 * card with no picture renders as a card, not as a grey placeholder.
 */
export interface ProjectItem {
  /** Also the message-key segment: `portfolio.projects.items.<id>.description`. */
  id: string;
  name: string;
  /** At most six — the cap is asserted in the constants test, not clipped at render. */
  techStack: readonly string[];
  /** Absent when there is nothing public to read; a link is rendered per entry. */
  source?: readonly ProjectSource[];
  /** A live deployment; absent when the project has none to show. */
  demo?: string;
}

/** One row of the education history — a link out, and no expandable body. */
export interface EducationItem {
  /** Also the message-key segment: `portfolio.education.items.<id>.degree`. */
  id: string;
  school: string;
  href: string;
  logo: StaticImageData;
}

/**
 * One labelled row of the skills section.
 *
 * The group's label is copy and is translated; the skills themselves are
 * product and language names, so they read the same in both locales and stay
 * here as data — the same split the work rows make.
 */
export interface SkillGroup {
  /** Also the message key: `portfolio.skills.groups.<id>`. */
  id: string;
  skills: readonly string[];
}

/**
 * One of the hero's quick actions — the three that are links. Printing is the
 * fourth and is not one of these: it acts on the current page rather than
 * leading anywhere, so it is a button, and a button in a list of destinations
 * would be a lie about what activating it does.
 */
export interface HeroActionItem {
  /** Also the message key: `portfolio.hero.actions.<id>`. */
  id: string;
  href: string;
  icon: IconComponent;
}

/** One contact line: an icon, the value's message key, and where it leads. */
export interface ContactItem {
  /** Also the message key: `portfolio.contact.items.<id>`. */
  id: string;
  icon: IconComponent;
  /** Absent for a line that is a fact rather than a destination. */
  href?: string;
}

/** One hobby line: an icon and the label's message key. */
export interface HobbyItem {
  /** Also the message key: `portfolio.hobbies.items.<id>`. */
  id: string;
  icon: IconComponent;
}
