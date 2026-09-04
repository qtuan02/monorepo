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
}

/** One row of the education history — a link out, and no expandable body. */
export interface EducationItem {
  /** Also the message-key segment: `portfolio.education.items.<id>.degree`. */
  id: string;
  school: string;
  href: string;
  logo: StaticImageData;
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
