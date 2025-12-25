import { Progress } from "@monorepo/ui";

export default function ProgressDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default (60%)</h3>
        <Progress value={60} />
      </div>

      {/* Low */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Low (25%)</h3>
        <Progress value={25} />
      </div>

      {/* High */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">High (90%)</h3>
        <Progress value={90} />
      </div>

      {/* Complete */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Complete (100%)</h3>
        <Progress value={100} />
      </div>
    </div>
  );
}
