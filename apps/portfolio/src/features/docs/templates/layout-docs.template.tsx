import { PropsWithChildren } from "react";
import AsideDocs from "../components/aside/aside-docs";

interface ILayoutDocsTemplateProps extends PropsWithChildren {
  locale: string;
}

export default function LayoutDocsTemplate(props: ILayoutDocsTemplateProps) {
  const { children, locale } = props;

  return (
    <main className="flex">
      <aside className="w-64 min-w-64 sticky top-15 h-[calc(100vh-60px)] overflow-y-auto scrollbar-none">
        <AsideDocs />
      </aside>
      <article className="flex-1 min-w-0">{children}</article>
    </main>
  );
}
