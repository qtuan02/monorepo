import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";

const importCode = `
import useToggle from "@repo/ui/hooks/use-toggle";
`;

const usageCode = `
const [isModalOpen, toggleModal] = useToggle();

return (
  <div>
    <button onClick={toggleModal}>Toggle Modal</button>
    {isModalOpen && <p>Modal Content</p>}
  </div>
);
`;

const originalCode = `
import { useState } from "react";

function useToggle(initialState = false) {
  const [state, setState] = useState(initialState);

  const toggle = () => setState((prev) => !prev);

  return [state, toggle] as const;
}

export default useToggle;
`;

const Toggle = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook useToggle" slug={slug} locale={locale}>
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

export default Toggle;
