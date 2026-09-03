import { Bold, Italic, Underline } from "lucide-react";

import { Toggle } from "@monorepo/ui";

export default function TogglePreview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Toggle aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Variants</h3>
        <div className="flex items-center gap-2">
          <Toggle variant="default" aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle italic">
            <Italic className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* With Text */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">With Text</h3>
        <Toggle aria-label="Toggle underline">
          <Underline className="mr-2 h-4 w-4" />
          Underline
        </Toggle>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Disabled</h3>
        <Toggle disabled aria-label="Toggle bold disabled">
          <Bold className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
}
