import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";

const importCode = `
import useMediaQuery from "@monorepo/ui/hooks/use-media-query";
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
      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
      <SectionCode title={t("original")}>
        <CodeBlock code={originalCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default MediaQuery;
