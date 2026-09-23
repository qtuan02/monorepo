import {
  BookOpenIcon,
  CalendarIcon,
  FilmIcon,
  MailIcon,
  MapPinIcon,
  MedalIcon,
  MusicIcon,
  PhoneIcon,
  PlaneIcon,
} from "lucide-react";

import type {
  ContactItem,
  EducationItem,
  HeroActionItem,
  HobbyItem,
  ProjectItem,
  ProjectSourceId,
  SkillGroup,
  WorkItem,
} from "~/features/home/types/resume";
import arobidLogo from "~/assets/logos/arobid.png";
import dcorpLogo from "~/assets/logos/dcorp.png";
import medvietLogo from "~/assets/logos/medviet.png";
import stuLogo from "~/assets/logos/stu.png";
import { GithubIcon } from "~/components/icons/github-icon";
import { LinkedinIcon } from "~/components/icons/linkedin-icon";
import { PROFILE_LINKS } from "~/constants/profile";

/**
 * The CV's structure. A plain module, deliberately **not** a `"use cache"`
 * server read: the content comes from no backend, never differs between two
 * requests, and a cached result has to be serializable — while every entry here
 * carries a `StaticImageData` and, below, a lucide component. A constant module
 * is already part of the static shell, so caching would buy nothing and cost the
 * icons.
 */
export const WORK_ITEMS: readonly WorkItem[] = [
  {
    id: "medviet",
    company: "MedViet",
    logo: medvietLogo,
    summary: "summary",
    techStack: [
      "Bun",
      "Turborepo",
      "React 19",
      "Vite",
      "Expo",
      "React Native",
      "TanStack Query",
      "Zustand",
      ".NET 8",
    ],
    bulletKeys: ["monorepo", "healthExam", "mobile", "legacy", "dotnet"],
  },
  {
    id: "arobid",
    company: "AROBID",
    logo: arobidLogo,
    summary: "summary",
    techStack: [
      "Monorepo",
      "React.js",
      "Next.js",
      "Payload",
      "Zustand",
      "TanStack Query",
      "Tailwind CSS",
      "MongoDB",
      "Radix UI",
      "Shadcn UI",
    ],
    bulletKeys: [
      "tradexpo",
      "immersive",
      "tracking",
      "mobile",
      "award",
      "cms",
      "rendering",
    ],
    award: "vda2025",
  },
  {
    id: "dcorp",
    company: "DCORP R-KEEPER",
    logo: dcorpLogo,
    summary: "summary",
    techStack: [
      "React.js",
      "Next.js",
      "Zustand",
      "TanStack Query",
      "Tailwind CSS",
      "Shadcn UI",
      "Daisy UI",
      "Ant Design",
      "Radix UI",
      "Storybook",
      "Monorepo",
    ],
    bulletKeys: ["omnichannel", "dataset", "emenu", "internal", "uiSystem"],
  },
];

/**
 * The three learning and demo projects a recruiter can open and check: each
 * has a public repository and a live deployment, and none is a production
 * product — which is why an item carries a one-line description and its
 * stack, and no bullets (#125). Order is by how much of the story each tells —
 * the monorepo is the site being read, so it goes first.
 */
export const PROJECT_ITEMS: readonly ProjectItem[] = [
  {
    id: "monorepo",
    name: "Personal Monorepo",
    techStack: [
      "Bun",
      "Turborepo",
      "Next.js",
      "React Router",
      "Vite",
      "GitHub Actions",
    ],
    source: [{ id: "repo", href: "https://github.com/qtuan02/monorepo" }],
    demo: "https://portfolio-ui-2025.vercel.app",
  },
  {
    id: "chat-socket",
    name: "Real-time Chat",
    techStack: [
      "React",
      "Rsbuild",
      "TanStack Query",
      "Spring Boot",
      "WebSocket",
      "Redis",
    ],
    source: [
      { id: "frontend", href: "https://github.com/qtuan02/chat-socket-fe" },
      { id: "backend", href: "https://github.com/qtuan02/chat-socket-be" },
    ],
    demo: "https://chat-socket-fe.vercel.app",
  },
  {
    id: "documents",
    name: "@fe-monorepo Docs",
    techStack: ["Vite", "React Router", "oxc-parser", "Storybook", "Vercel"],
    source: [
      {
        id: "repo",
        href: "https://github.com/qtuan02/monorepo/tree/main/apps/documents",
      },
    ],
  },
];

/**
 * The label each kind of source link carries, as a message key. It sits beside
 * the items rather than in the card because it is the same join the bullet
 * keys make — structure on this side, the string on the catalogue side — and
 * the constants test walks it for every locale.
 */
export const PROJECT_SOURCE_LABEL_KEYS: Readonly<
  Record<ProjectSourceId, string>
> = {
  repo: "portfolio.projects.links.source",
  frontend: "portfolio.projects.links.sourceFrontend",
  backend: "portfolio.projects.links.sourceBackend",
};

export const EDUCATION_ITEMS: readonly EducationItem[] = [
  {
    id: "stu",
    school: "Saigon Technology University",
    href: "https://stu.edu.vn",
    logo: stuLogo,
  },
];

/**
 * The skill map, in six labelled rows rather than one flat strip.
 *
 * The order is the order it is read in, and it is an argument: languages
 * first — the base everything else is written in — then frontend, since that
 * is the depth being claimed, mobile and backend next because those are what
 * "full-stack when the project needs it" has to be backed by, then the two
 * rows about how the work is shipped. Names are product names and are not
 * translated; the row labels are, and live under `portfolio.skills.groups.<id>`.
 * A name lives in exactly one group — `resume.test.ts` pins it — so
 * TypeScript sits in `languages` and not also in `frontend`.
 */
export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: "languages",
    skills: ["TypeScript", "JavaScript", "Java", "C#"],
  },
  {
    id: "frontend",
    skills: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "shadcn/ui",
      "TanStack Query",
      "Zustand",
      "React Hook Form + Zod",
      "Storybook",
      "i18n",
      "Redux",
      "Ant Design",
    ],
  },
  {
    id: "mobile",
    skills: ["React Native", "Expo", "NativeWind", "Reanimated"],
  },
  {
    id: "backend",
    skills: [
      "Spring Boot",
      ".NET 8",
      "PayloadCMS",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Node.js",
    ],
  },
  {
    id: "devops",
    skills: ["Docker", "GitHub Actions", "Vercel", "Turborepo", "Changesets"],
  },
  {
    id: "tooling",
    skills: ["Bun", "Biome", "Vitest", "Playwright", "Figma"],
  },
];

/**
 * The hero's link actions, in the order they sit along the row. Email leads,
 * because for a CV the real call to action is a message — not a "hire me"
 * button.
 */
export const HERO_ACTIONS: readonly HeroActionItem[] = [
  { id: "email", href: PROFILE_LINKS.email, icon: MailIcon },
  { id: "github", href: PROFILE_LINKS.github, icon: GithubIcon },
  { id: "linkedin", href: PROFILE_LINKS.linkedin, icon: LinkedinIcon },
];

export const CONTACT_ITEMS: readonly ContactItem[] = [
  { id: "birthday", icon: CalendarIcon },
  { id: "phone", icon: PhoneIcon, href: PROFILE_LINKS.phone },
  { id: "location", icon: MapPinIcon },
  { id: "github", icon: GithubIcon, href: PROFILE_LINKS.github },
  { id: "email", icon: MailIcon, href: PROFILE_LINKS.email },
  { id: "linkedin", icon: LinkedinIcon, href: PROFILE_LINKS.linkedin },
];

export const HOBBY_ITEMS: readonly HobbyItem[] = [
  { id: "sport", icon: MedalIcon },
  { id: "reading", icon: BookOpenIcon },
  { id: "travel", icon: PlaneIcon },
  { id: "music", icon: MusicIcon },
  { id: "movies", icon: FilmIcon },
];
