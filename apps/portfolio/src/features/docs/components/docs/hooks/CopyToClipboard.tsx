import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";

const importCode = `
import useCopyToClipboard from "@repo/ui/hooks/use-copy-to-clipboard";
`;

const usageCode = `
const { copied, copiedText, copy } = useCopyToClipboard();

return (
  <button onClick={() => copy("Hello, world!")}>
    {copied ? "Copied" : "Copy"}
    <span>{copiedText}</span>
  </button>
);
`;

const originalCode = `
import { useCallback, useEffect, useRef, useState } from "react";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

function useCopyToClipboard(delay = 1500) {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator.clipboard) {
        console.warn("Clipboard not supported");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          setCopiedText(null);
        }, delay);

        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setCopiedText(null);
        return false;
      }
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    copied: !!copiedText,
    copiedText,
    copy,
  };
}

export default useCopyToClipboard;
`;

const CopyToClipboard = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook useClickCopyClipboard" slug={slug} locale={locale}>
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

export default CopyToClipboard;
