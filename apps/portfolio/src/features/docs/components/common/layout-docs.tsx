import { cn } from "@repo/ui/libs/cn";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PropsWithChildren } from "react";
import { getDataDocs } from "../../utils/get-data-docs";
import { getTranslations } from "next-intl/server";
import NextLink from "~/components/next-link";

interface ILayoutDocsProps extends PropsWithChildren {
  title: string;
  className?: string;
  slug?: string[];
  locale: string;
}

const LayoutDocs = async (props: ILayoutDocsProps) => {
  const { title, children, className, slug, locale } = props;

  const t = await getTranslations({ locale });

  const flatDocs = getDataDocs(t).flatMap((doc) => doc.children);
  const currentIndex = flatDocs.findIndex(
    (doc) => doc.key === (slug?.[0] ?? "introduction")
  );
  const previous = flatDocs[currentIndex - 1] || null;
  const next = flatDocs[currentIndex + 1] || null;

  return (
    <div className={cn("space-y-4  max-w-3xl mx-auto", className)}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
      <div className="flex justify-between items-center h-16">
        {previous ? (
          <NextLink
            href={`${previous.href}`}
            className="text-base px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-x-2"
          >
            <ArrowLeft className="size-4" />
            <span>{previous?.label}</span>
          </NextLink>
        ) : (
          <div></div>
        )}
        {next ? (
          <NextLink
            href={`${next.href}`}
            className="text-base px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-x-2"
          >
            <span>{next.label}</span>
            <ArrowRight className="size-4" />
          </NextLink>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default LayoutDocs;
