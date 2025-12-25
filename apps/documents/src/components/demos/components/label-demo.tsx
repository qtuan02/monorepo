import { Label } from "@monorepo/ui";

export default function LabelDemo() {
  return (
    <div className="flex flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Label>Email address</Label>
      </div>

      {/* With htmlFor */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">With Input</h3>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
