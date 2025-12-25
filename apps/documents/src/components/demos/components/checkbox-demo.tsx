import { Checkbox, Label } from "@monorepo/ui";

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Disabled</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="disabled" disabled />
          <Label htmlFor="disabled">Disabled checkbox</Label>
        </div>
      </div>

      {/* Checked */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Checked</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="checked" defaultChecked />
          <Label htmlFor="checked">Checked by default</Label>
        </div>
      </div>
    </div>
  );
}
