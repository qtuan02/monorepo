import { Avatar, AvatarFallback, AvatarImage, Badge } from "@monorepo/ui";

import BlurFade from "~/components/blur-fade";
import BlurFadeText from "~/components/blur-fade-text";
import { ResumeCard } from "~/components/resume-card";
import { DATA } from "~/constants/data";

const BLUR_FADE_DELAY = 0.08;

export default function HomePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col space-y-10">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="flex justify-between gap-2">
            <div className="flex flex-1 flex-col space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={DATA.header.title}
                postFix={<div className="animate-bounce">👋</div>}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.header.subtitle}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-30 border">
                <AvatarImage alt="HT" src={DATA.header.avatarUrl} />
                <AvatarFallback>HT</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="space-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <h2 className="text-xl font-bold">{DATA.about.title}</h2>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="text-muted-foreground max-w-full space-y-2 text-sm">
              {DATA.about.data.map((item, index) => (
                <p key={`about-${index}`}>{item}</p>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>

      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
          </BlurFade>
          <div className="flex flex-col gap-y-5">
            {DATA.work.data.map((work, index) => (
              <BlurFade
                key={`work-${index}`}
                delay={BLUR_FADE_DELAY * 6 + index * 0.05}
              >
                <ResumeCard
                  key={work.company}
                  defaultExpanded
                  logoUrl={work.logoUrl}
                  altText={work.company}
                  title={work.company}
                  subtitle={work.title}
                  period={`${work.start} - ${work.end ?? "Present"}`}
                  description={work.description}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {DATA.education.data.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">Skills</h2>
          </BlurFade>
          <div className="flex flex-wrap gap-2">
            {DATA.skills.data.map((skill, index) => (
              <BlurFade
                key={`skill-${index}`}
                delay={BLUR_FADE_DELAY * 10 + index * 0.05}
              >
                <Badge className="rounded-sm px-3 py-1 transition-all duration-300 hover:-translate-y-1">
                  {skill}
                </Badge>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
