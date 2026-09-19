import { ScrollText } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@monorepo/ui/components/item";

import type { Contract } from "~/types/contract";
import { StatusBadge } from "~/components/badge/status-badge";
import { contractStatusConfig } from "~/constants/status";
import { formatDate } from "~/utils/date";
import ContractRowActions from "./contract-row-actions";

/** A Hợp đồng table row's mobile substitute — `renderMobileRow` on `DataTable`. */
export default function ContractMobileRow({
  contract,
}: {
  contract: Contract;
}) {
  return (
    <Item variant="outline" size="sm">
      <ItemMedia variant="icon">
        <ScrollText />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{contract.contractNumber}</ItemTitle>
        <ItemDescription>
          {contract.tenant} · {contract.room} · {formatDate(contract.endDate)}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <StatusBadge config={contractStatusConfig[contract.status]} isCompact />
        <ContractRowActions contract={contract} />
      </ItemActions>
    </Item>
  );
}
