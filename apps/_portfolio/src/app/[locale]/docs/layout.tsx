import type { NextParams } from "~/types/common";
import LayoutDocsTemplate from "~/features/docs/templates/layout-docs.template";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: NextParams;
}) {
  const { locale } = await params;

  return <LayoutDocsTemplate locale={locale}>{children}</LayoutDocsTemplate>;
}
