import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";

const importCode = `
import useFetch from "@repo/ui/hooks/use-fetch";
`;

const usageCode = `
const { data, loading, error } = useFetch<User[]>('/api/users');

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;

return <ul>{data?.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
`;

const originalCode = `
import { useState, useEffect } from "react";

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
`;

const Fetch = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Hook useFetch" slug={slug} locale={locale}>
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

export default Fetch;
