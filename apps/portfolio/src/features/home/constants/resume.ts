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
    techStack: [
      "Bun",
      "Turborepo",
      "React 19",
      "Vite",
      "Expo",
      "React Native",
      "NativeWind",
      "TanStack Query",
      "Zustand",
      "Next.js",
      "Redux",
      ".NET 8",
      "EF Core",
    ],
    bulletKeys: ["monorepo", "mobile", "legacy", "dotnet"],
  },
  {
    id: "arobid",
    company: "AROBID",
    logo: arobidLogo,
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

export const EDUCATION_ITEMS: readonly EducationItem[] = [
  {
    id: "stu",
    school: "Saigon Technology University",
    href: "https://stu.edu.vn",
    logo: stuLogo,
  },
];

/**
 * The skill map, in five labelled rows rather than one flat strip.
 *
 * The order is the order it is read in, and it is an argument: frontend first
 * because that is the depth being claimed, mobile and backend next because
 * those are what "full-stack when the project needs it" has to be backed by,
 * then the two rows about how the work is shipped. Names are product names and
 * are not translated; the row labels are, and live under
 * `portfolio.skills.groups.<id>`.
 */
export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: "frontend",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "TanStack Query",
      "Zustand",
      "React Hook Form + Zod",
      "Storybook",
      "i18n",
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
