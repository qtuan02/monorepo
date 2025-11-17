"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface ISectionPreviewReloadProps extends PropsWithChildren {
  title: string;
}

const SectionPreviewReload = (props: ISectionPreviewReloadProps) => {
  const { title, children } = props;
  const [key, setKey] = useState<string>("");

  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium md:text-lg">{title}</h2>
      <div
        key={key}
        className="relative rounded-md border border-gray-200 p-5 dark:border-gray-800"
      >
        <button
          className="absolute top-2 right-2 cursor-pointer rounded-md bg-gray-500/50 p-2 text-gray-800 transition-all duration-300 hover:translate-y-[-1px] dark:bg-gray-800/80 dark:text-gray-200"
          onClick={() => setKey(key + 1)}
        >
          <RotateCcw className="size-3 text-white md:size-4" />
        </button>
        {children}
      </div>
    </section>
  );
};

export default SectionPreviewReload;
