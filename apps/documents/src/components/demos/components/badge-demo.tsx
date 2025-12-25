import { Badge } from "@monorepo/ui";

export default function BadgeDemo() {
  return (
    <div className="flex flex-col gap-6">
      {/* Variants */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Variants</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
    </div>
  );
}
