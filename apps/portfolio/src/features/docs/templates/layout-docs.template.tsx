import { PropsWithChildren } from "react";

import AsideDocs from "../components/aside/aside-docs";

interface ILayoutDocsTemplateProps extends PropsWithChildren {
  locale: string;
}

export default function LayoutDocsTemplate(props: ILayoutDocsTemplateProps) {
  const { children } = props;

  return (
    <main className="relative flex">
      <aside className="top-15 scrollbar-none sticky hidden h-[85dvh] w-64 min-w-64 overflow-y-auto md:block">
        <AsideDocs />
      </aside>
      <article className="min-w-0 flex-1">{children}</article>
    </main>
  );
}
