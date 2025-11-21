import type { IDocComponentProps } from "~/types/docs";
import { NextImage } from "~/components/next-image";
import LayoutDocs from "../../common/layout-docs";

const Flex = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  return (
    <LayoutDocs title="CSS Flexbox" slug={slug} locale={locale}>
      <NextImage
        src="/css_flex.webp"
        alt="flex-image"
        priority
        width={500}
        height={500}
        imageClassName="size-full object-cover"
      />
    </LayoutDocs>
  );
};

export default Flex;
