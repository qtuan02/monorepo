import { Button } from "@monorepo/ui";

export default function ButtonDemo() {
  return (
    <div className="flex flex-col gap-8">
      {/* Default variants */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Variants</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* States */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">States</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </div>
  );
}
