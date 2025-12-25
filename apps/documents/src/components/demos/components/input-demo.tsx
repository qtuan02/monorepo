import { Input } from "@monorepo/ui";

export default function InputDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Input placeholder="Enter your email..." />
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Disabled</h3>
        <Input placeholder="Disabled input" disabled />
      </div>

      {/* With type */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Password</h3>
        <Input type="password" placeholder="Enter password" />
      </div>
    </div>
  );
}
