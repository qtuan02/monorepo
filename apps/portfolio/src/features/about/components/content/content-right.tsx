import BadgeSkill from "./badge-skill";
import CardSection from "../card/card-section";
import CardExperience from "./card-experience";
import { Book, Film, Medal, Music, Plane } from "lucide-react";
import { getTranslations } from "next-intl/server";

const ContentRight = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({
    locale,
    namespace: "About",
  });

  return (
    <CardSection className="flex flex-col gap-y-6">
      <section id="overview" className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-medium">{t("overview")}</h2>
        <div className="flex flex-col gap-y-3">
          <p className="text-gray-600">{t("overview_description_1")}</p>
          <p className="text-gray-600">{t("overview_description_2")}</p>
          <p className="text-gray-600">{t("overview_description_3")}</p>
          <p className="text-gray-600">{t("overview_description_4")}</p>
        </div>
      </section>
      <section id="skills" className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-medium">{t("skills")}</h2>
        <div className="flex flex-wrap gap-2">
          <BadgeSkill name="React" />
          <BadgeSkill name="Next.js" />
          <BadgeSkill name="Tailwind CSS" />
          <BadgeSkill name="JavaScript" />
          <BadgeSkill name="TypeScript" />
          <BadgeSkill name="HTML" />
          <BadgeSkill name="CSS" />
          <BadgeSkill name="Axios" />
          <BadgeSkill name="React Router" />
          <BadgeSkill name="Zod" />
          <BadgeSkill name="React Hook Form" />
          <BadgeSkill name="React Query" />
          <BadgeSkill name="Zustand" />
          <BadgeSkill name="Redux" />
          <BadgeSkill name="Node.js" />
          <BadgeSkill name="Express.js" />
          <BadgeSkill name="Payload CMS" />
          <BadgeSkill name="MongoDB" />
          <BadgeSkill name="Git" />
          <BadgeSkill name="GitLab" />
          <BadgeSkill name="Responsive Design" />
          <BadgeSkill name="Figma" />
        </div>
      </section>

      <section id="experience" className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-medium">{t("experience")}</h2>
        <div className="flex flex-col gap-y-4">
          <CardExperience
            position="Junior Frontend Developer"
            company="CÔNG TY CỔ PHẦN CÔNG NGHỆ AROBID"
            date="05/2025 - Present"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <CardExperience
            position="Fresher Frontend Developer"
            company="CÔNG TY CỔ PHẦN CÔNG NGHỆ DCORP"
            date="09/2024 - 05/2025"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <CardExperience
            position="Internship Developer (Remote)"
            company="CÔNG TY TNHH WISDOMROBOTICS"
            date="09/2024 - 05/2025"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        </div>
      </section>

      <section id="orther" className="flex gap-x-4">
        <div className="w-1/2 flex flex-col gap-y-4">
          <h2 className="text-2xl font-medium">{t("education")}</h2>
          <div className="flex flex-col gap-y-1">
            <p className=" font-medium">{t("major")}</p>
            <p className="text-gray-600">{t("education_year")}: 2020 - 2024</p>
            <p className="text-gray-600">{t("school")}</p>
            <p className="mt-3 font-medium">{t("english_level")}</p>
          </div>
        </div>
        <div className="w-1/2 flex flex-col gap-y-4">
          <h2 className="text-2xl font-medium">{t("hobbies")}</h2>
          <div className="flex flex-col gap-y-1">
            <p className="flex items-center gap-x-2">
              <Medal className="size-4 text-orange-400" />
              {t("sport")}
            </p>
            <p className="flex items-center gap-x-2">
              <Book className="size-4 text-orange-400" />
              {t("read_book")}
            </p>
            <p className="flex items-center gap-x-2">
              <Plane className="size-4 text-orange-400" /> {t("travel")}
            </p>
            <p className="flex items-center gap-x-2">
              <Music className="size-4 text-orange-400" /> {t("listen_music")}
            </p>
            <p className="flex items-center gap-x-2">
              <Film className="size-4 text-orange-400" /> {t("watch_movie")}
            </p>
          </div>
        </div>
      </section>
    </CardSection>
  );
};

export default ContentRight;
