import { Slider } from "@monorepo/ui";

export default function SliderDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>

      {/* Range */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Range</h3>
        <Slider defaultValue={[25, 75]} max={100} step={1} />
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Disabled</h3>
        <Slider defaultValue={[50]} max={100} step={1} disabled />
      </div>
    </div>
  );
}
