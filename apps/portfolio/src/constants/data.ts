import {
  BookOpenIcon,
  CalendarIcon,
  FilmIcon,
  GithubIcon,
  HomeIcon,
  MailIcon,
  MapPinIcon,
  MedalIcon,
  MusicIcon,
  PhoneIcon,
  PlaneIcon,
} from "lucide-react";

export const DATA = {
  header: {
    title: "Hi, I'm Tuan",
    subtitle:
      "With a passion for programming, I constantly seek opportunities to learn, experiment, and apply new technology trends to products",
    avatarUrl: "/avatar.jpg",
  },
  about: {
    title: "About",
    data: [
      "I'm Huynh Quoc Tuan, a Frontend Developer with over 1.5 years of experience in developing modern web applications. I'm passionate about building user interfaces that are visually appealing, easy to use, and performance-optimized.",
      "I have experience working with React, Next.js, TypeScript, Tailwind CSS, and React Query, along with the ability to flexibly handle various rendering techniques such as CSR, SSR, SSG, and ISR. In addition, I am also proficient in implementing API Routes, Server Actions, and optimizing SEO for web applications.",
      "In addition to my role as a Frontend Developer, I am also capable of handling certain Backend tasks, including building RESTful APIs, processing business logic, and connecting to databases.",
    ],
  },
  work: {
    title: "Work Experience",
    data: [
      {
        logoUrl: "/arobid.png",
        altText: "arobid",
        company: "AROBID",
        title: "Junior Frontend Developer",
        start: "May 2025",
        end: "Present",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
      {
        logoUrl: "/dcorp.png",
        altText: "dcorp",
        company: "DCORP R-KEEPER",
        title: "Fresher Frontend Developer",
        start: "Sep 2024",
        end: "May 2025",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
      {
        logoUrl: "/wisdom.jpg",
        altText: "wisdomrobotics",
        company: "WISDOMROBOTICS",
        title: "Internship Frontend Developer",
        start: "Mar 2024",
        end: "Jun 2024",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
    ],
  },
  education: {
    title: "Education",
    data: [
      {
        logoUrl: "/stu.png",
        altText: "Saigon Technology University",
        href: "https://stu.edu.vn",
        school: "Saigon Technology University",
        degree: "Engineer Degree – Information Technology Engineering",
        start: "2020",
        end: "2024",
      },
    ],
  },
  skills: {
    title: "Skills",
    data: [
      "React",
      "Next.js",
      "React Native",
      "Expo",
      "Tailwind",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Git",
      "Responsive",
    ],
  },
  navbar: [
    {
      href: "/#",
      label: "Home",
      icon: HomeIcon,
    },
    {
      href: "https://github.com/qtuan02",
      label: "GitHub",
      icon: GithubIcon,
    },
  ],
  contact: {
    title: "Contact",
    data: [
      {
        icon: CalendarIcon,
        href: "#",
        label: "20/07/2002",
      },
      {
        icon: PhoneIcon,
        href: "tel:+84393653862",
        label: "(+84) 393 653 862",
      },
      {
        icon: MapPinIcon,
        href: "#",
        label: "District 7, Ho Chi Minh city, Vietnam",
      },

      {
        icon: GithubIcon,
        href: "https://github.com/qtuan02",
        label: "github.com/qtuan02",
      },
      {
        icon: MailIcon,
        href: "mailto:huynhquoctuan200702@gmail.com",
        label: "huynhquoctuan200702@gmail.com",
      },
    ],
  },
  hobbies: {
    title: "Hobbies",
    data: [
      {
        icon: MedalIcon,
        label: "Sport",
      },
      {
        icon: BookOpenIcon,
        label: "Read book",
      },
      {
        icon: PlaneIcon,
        label: "Travel",
      },
      {
        icon: MusicIcon,
        label: "Listen music",
      },
      {
        icon: FilmIcon,
        label: "Watch movie",
      },
    ],
  },
};
