import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import RateLimitPreview from "./preview-client/rate-limit-preview";

const importCode = `
"use client";

import { Button } from "@monorepo/ui/shadcn-ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
`;

const usageCode = `
const [loading, setLoading] = useState(false);
const [resMessage, setResMessage] = useState("");

<div className="flex flex-col gap-3">
  <p>
    Try to send 3 requests in 1 minute. The rate limit is 2 requests per minute.
  </p>
  <Button
    disabled={loading}
    onClick={async () => {
      setLoading(true);
      setResMessage("");
      try {
        const res = await fetch("/api/rate-limit");
        if (res.status !== 200) {
          const errRes = await res.json();
          setResMessage(errRes.error);
          return;
        }
        const data = await res.json();

        setResMessage(data.message);
      } catch (err) {
        setResMessage(JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    }}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send request"}
  </Button>
  <div>{resMessage}</div>
</div>
`;

const RateLimit = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="RateLimit (Next.js)" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <RateLimitPreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default RateLimit;
