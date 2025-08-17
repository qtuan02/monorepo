import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";

const importCode = `
import useUnmount from "@repo/ui/hooks/use-unmount";
`;

const usageCode = `
useUnmount(() => {
  console.log("Component unmounted");
});
`;

const originalCode = `
import { useEffect, useRef } from "react";

function useUnmount(func: () => void) {
  const funcRef = useRef(func);

  funcRef.current = func;

  useEffect(
    () => () => {
      funcRef.current();
    },
    []
  );
}

export default useUnmount;
`;

const Unmount = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook useUnmount" slug={slug} locale={locale}>
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

export default Unmount;
