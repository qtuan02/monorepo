import { Copy, Eye, FileX, RefreshCw } from "lucide-react";

import { useCopyToClipboard } from "@monorepo/hook/use-copy-to-clipboard";

import type { Contract } from "~/types/contract";
import { EntityActionMenu } from "~/components/menu/entity-action-menu";
import { ROUTES } from "~/constants/routes";

interface ContractRowActionsProps {
  contract: Contract;
  side?: "top" | "bottom";
}

/** The "⋯" of a Hợp đồng row or card, with the two lifecycle screens reachable from it. */
export default function ContractRowActions({
  contract,
  side = "bottom",
}: ContractRowActionsProps) {
  const [, copy] = useCopyToClipboard();
  const isEnded = contract.status === "ended";

  return (
    <EntityActionMenu
      side={side}
      items={[
        {
          key: "copy",
          label: "Sao chép ID",
          icon: <Copy />,
          onClick: () => void copy(contract.id),
        },
        {
          key: "detail",
          label: "Xem chi tiết",
          icon: <Eye />,
          link: ROUTES.contractDetailPath(contract.id),
        },
        {
          key: "renew",
          label: "Gia hạn",
          icon: <RefreshCw />,
          link: isEnded ? undefined : ROUTES.contractRenewPath(contract.id),
        },
        {
          key: "liquidation",
          label: "Thanh lý",
          icon: <FileX />,
          link: isEnded
            ? undefined
            : ROUTES.contractLiquidationPath(contract.id),
          isDestructive: true,
        },
      ]}
    />
  );
}
