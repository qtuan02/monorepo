import type { NextParams } from "~/types/common";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;

  return <div>Locale: {locale}</div>;
}
