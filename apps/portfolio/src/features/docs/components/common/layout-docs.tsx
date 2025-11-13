import { PropsWithChildren } from "react";
import { TypingText } from "@monorepo/ui/animate-ui/text-typing";
import { cn } from "@monorepo/ui/libs/cn";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import NextLink from "~/components/next-link";
import { getDataDocs } from "../../utils/get-data-docs";

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
    (doc) => doc.key === (slug?.[0] ?? "introduction"),
  );
  const previous = flatDocs[currentIndex - 1] || null;
  const next = flatDocs[currentIndex + 1] || null;

  return (
    <div className={cn("mx-auto max-w-3xl space-y-4", className)}>
      <div className="h-8">
        <TypingText
          className="text-2xl font-semibold"
          text={title}
          duration={50}
        />
      </div>
      {children}
      <div className="flex h-16 items-center justify-between gap-x-2">
        {previous ? (
          <NextLink
            replace
            href={previous.href}
            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-gray-200 px-4 py-2 text-base transition-colors duration-400 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="size-4" />
            <span className="line-clamp-1">{previous?.label}</span>
          </NextLink>
        ) : (
          <div></div>
        )}
        {next ? (
          <NextLink
            replace
            href={next.href}
            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-gray-200 px-4 py-2 text-base transition-colors duration-400 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-800"
          >
            <span className="line-clamp-1">{next.label}</span>
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
