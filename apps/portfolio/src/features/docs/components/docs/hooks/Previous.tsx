import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";

const importCode = `
import usePrevious from "@repo/ui/hooks/use-previous";
`;

const usageCode = `
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);

return (
  <p>
    Now: {count}, Before: {prevCount}
  </p>
);
`;

const originalCode = `
import { useEffect, useRef } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;

`;

const Previous = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook usePrevious" slug={slug} locale={locale}>
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

export default Previous;
