import { Textarea } from "@monorepo/ui";

export default function TextareaPreview() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Textarea placeholder="Type your message here..." />
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Disabled</h3>
        <Textarea placeholder="Disabled textarea" disabled />
      </div>

      {/* With value */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">With Value</h3>
        <Textarea defaultValue="This is a pre-filled textarea with some content." />
      </div>
    </div>
  );
}
