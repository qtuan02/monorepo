import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";

const importCode = `
import useLocalStorage from "@repo/ui/hooks/use-local-storage";
`;

const usageCode = `
const [value, setValue] = useLocalStorage("my-key", "default-value");

return <input value={value} onChange={(e) => setValue(e.target.value)} />;
`;

const originalCode = `
import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
`;

const LocalStorage = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook useLocalStorage" slug={slug} locale={locale}>
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

export default LocalStorage;
