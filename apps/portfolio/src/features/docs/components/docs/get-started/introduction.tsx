import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import { getTranslations } from "next-intl/server";

const Introduction = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  const list = t.raw("intro-content.list") as unknown;

  return (
    <LayoutDocs title={t("introduction")} slug={slug} locale={locale}>
      <div className="flex flex-col gap-y-2">
        <p>{t("intro-content.paragraph1")}</p>
        <p>{t("intro-content.paragraph2")}</p>
        {Array.isArray(list) && (
          <ul className="list-disc pl-6 space-y-1">
            {list.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
        <p>{t("intro-content.paragraph3")}</p>
      </div>
    </LayoutDocs>
  );
};

export default Introduction;
