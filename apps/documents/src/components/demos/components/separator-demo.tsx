import { Separator } from "@monorepo/ui";

export default function SeparatorDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Horizontal */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Horizontal</h3>
        <div>
          <div className="space-y-1">
            <h4 className="text-sm leading-none font-medium">
              Radix Primitives
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              An open-source UI component library.
            </p>
          </div>
          <Separator className="my-4" />
          <div className="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <Separator orientation="vertical" />
            <div>Docs</div>
            <Separator orientation="vertical" />
            <div>Source</div>
          </div>
        </div>
      </div>
    </div>
  );
}
