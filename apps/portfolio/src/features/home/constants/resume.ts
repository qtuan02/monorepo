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
  HobbyItem,
  WorkItem,
} from "~/features/home/types/resume";
import arobidLogo from "~/assets/logos/arobid.png";
import dcorpLogo from "~/assets/logos/dcorp.png";
import fptisLogo from "~/assets/logos/fptis.jpg";
import stuLogo from "~/assets/logos/stu.png";
import wisdomLogo from "~/assets/logos/wisdom.jpg";
import { GithubIcon } from "~/components/icons/github-icon";

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
    id: "fptis",
    company: "FPT IS",
    logo: fptisLogo,
    techStack: [
      "Microservices",
      "Monorepo",
      "React.js",
      "Java Spring Boot",
      "PostgreSQL",
    ],
    bulletKeys: [
      "system",
      "modules",
      "screens",
      "components",
      "logic",
      "stability",
    ],
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
      "award",
      "cms",
      "rendering",
    ],
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
  {
    id: "wisdom",
    company: "WISDOM ROBOTICS",
    logo: wisdomLogo,
    techStack: [
      "Spring Boot",
      "React.js",
      "Spring Data JPA",
      "PostgreSQL",
      "Tailwind CSS",
      "Redux",
    ],
    bulletKeys: ["project", "backend", "modules"],
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

/** Product and language names — the same in every locale, so not translated. */
export const SKILLS: readonly string[] = [
  "JavaScript",
  "TypeScript",
  "React.js",
  "Next.js",
  "Zustand",
  "Redux",
  "TanStack Query",
  "Spring Boot",
  "Node.js",
  "Express.js",
  "PostgreSQL",
  "MongoDB",
  "Git",
  "Figma",
  "Docker",
  "SSR",
  "ISR",
  "Monorepo",
  "Microservices",
];

export const CONTACT_ITEMS: readonly ContactItem[] = [
  { id: "birthday", icon: CalendarIcon },
  { id: "phone", icon: PhoneIcon, href: "tel:+84393653862" },
  { id: "location", icon: MapPinIcon },
  { id: "github", icon: GithubIcon, href: "https://github.com/qtuan02" },
  {
    id: "email",
    icon: MailIcon,
    href: "mailto:huynhquoctuan200702@gmail.com",
  },
];

export const HOBBY_ITEMS: readonly HobbyItem[] = [
  { id: "sport", icon: MedalIcon },
  { id: "reading", icon: BookOpenIcon },
  { id: "travel", icon: PlaneIcon },
  { id: "music", icon: MusicIcon },
  { id: "movies", icon: FilmIcon },
];
