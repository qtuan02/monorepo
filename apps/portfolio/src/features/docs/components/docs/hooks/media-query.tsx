import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";

const importCode = `
import useMediaQuery from "@repo/ui/hooks/use-media-query";
`;

const usageCode = `
const isMobile = useMediaQuery("(max-width: 768px)");

return <p>{isMobile ? "Mobile" : "Desktop"}</p>;
`;

const originalCode = `
import { useState, useEffect } from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const updateMatch = () => setMatches(mediaQueryList.matches);
    updateMatch();

    mediaQueryList.addEventListener("change", updateMatch);
    return () => mediaQueryList.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

export default useMediaQuery;
`;

const MediaQuery = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook useMediaQuery" slug={slug} locale={locale}>
      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
      <SectionDocs title={t("original")}>
        <CodeBlock code={originalCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default MediaQuery;
