import { Label, Switch } from "@monorepo/ui";

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Disabled</h3>
        <div className="flex items-center space-x-2">
          <Switch id="disabled" disabled />
          <Label htmlFor="disabled">Disabled</Label>
        </div>
      </div>

      {/* Checked */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Checked</h3>
        <div className="flex items-center space-x-2">
          <Switch id="checked" defaultChecked />
          <Label htmlFor="checked">Enabled by default</Label>
        </div>
      </div>
    </div>
  );
}
