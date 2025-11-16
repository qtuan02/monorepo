import type { IDocComponentProps } from "~/types/docs";
import { NextImage } from "~/components/next-image";
import LayoutDocs from "../../common/layout-docs";

const Grid = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  return (
    <LayoutDocs title="CSS Grid Layout" slug={slug} locale={locale}>
      <NextImage
        src="/css_grid.webp"
        alt="grid-image"
        priority
        width={500}
        height={500}
        imageClassName="size-full object-cover"
      />
    </LayoutDocs>
  );
};

export default Grid;
