import type { NextParams } from "~/types/common";
import HomeTemplate from "~/features/home/templates/home.template";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;

  return <HomeTemplate locale={locale} />;
}
