import MenuTemplate from "~/features/menu/templates/menu.template";

// export async function generateMetadata({
//   params,
// }: {
//   params: NextParams;
// }): Promise<Metadata> {
//   const { locale } = await params;
//   const t = await getTranslations({
//     locale,
//     namespace: "Menu",
//   });

//   return getMetadataDefault(locale, {
//     title: t("title"),
//     description: t("description"),
//     openGraph: {
//       title: t("title"),
//       description: t("description"),
//     },
//     twitter: {
//       title: t("title"),
//       description: t("description"),
//     },
//   });
// }

export default function MenuPage() {
  return <MenuTemplate />;
}
