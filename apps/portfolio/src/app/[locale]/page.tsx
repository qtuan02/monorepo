import HomeTemplate from "~/features/home/templates/home.template";
import { routing } from "~/i18n/routing";
import { NextParams } from "~/types/common";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;

  return <HomeTemplate locale={locale} />;
}
