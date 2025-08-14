import HomeTemplate from "~/features/home/templates/home.template";
import { NextParams } from "~/types/common";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;

  return <HomeTemplate locale={locale} />;
}
