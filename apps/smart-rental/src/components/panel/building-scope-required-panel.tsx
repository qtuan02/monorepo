import { Building2 } from "lucide-react";

import { EmptyPanel } from "~/components/panel/empty-panel";

interface BuildingScopeRequiredPanelProps {
  description: string;
}

/**
 * Đợt hoá đơn and Nhập chỉ số both need exactly one Toà nhà (spec #153 §10
 * row 4) — `null` has no single ngày thu / Bảng giá to apply. Shown instead
 * of the form until the Building scope row above picks one.
 */
export function BuildingScopeRequiredPanel({
  description,
}: BuildingScopeRequiredPanelProps) {
  return (
    <EmptyPanel
      icon={Building2}
      title="Chọn một Toà nhà trước khi tiếp tục"
      description={description}
      className="border"
    />
  );
}
