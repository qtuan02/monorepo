"use client";

import { RotateCcw } from "lucide-react";
import { PropsWithChildren, useState } from "react";

interface ISectionPreviewReloadProps extends PropsWithChildren {
  title: string;
}

const SectionPreviewReload = (props: ISectionPreviewReloadProps) => {
  const { title, children } = props;
  const [key, setKey] = useState<string>("");

  return (
    <section className="space-y-2">
      <h2 className="text-base md:text-lg font-medium">{title}</h2>
      <div
        key={key}
        className="border border-gray-200 dark:border-gray-800 rounded-md p-5 relative"
      >
        <button
          className="absolute top-2 right-2 cursor-pointer bg-gray-500/50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:translate-y-[-1px] transition-all duration-300"
          onClick={() => setKey(key + 1)}
        >
          <RotateCcw className="size-3 md:size-4 text-white" />
        </button>
        {children}
      </div>
    </section>
  );
};

export default SectionPreviewReload;
