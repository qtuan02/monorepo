import { Calendar, FileText, Home, Landmark, User } from "lucide-react";

import { CardContent, CardHeader } from "@monorepo/ui/components/card";

import type { Contract } from "~/types/contract";
import { StatusBadge } from "~/components/badge/status-badge";
import { EntityListCard } from "~/components/card/entity-list-card";
import { contractStatusConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";
import ContractRowActions from "./contract-row-actions";

interface ContractCardProps {
  contract: Contract;
}

/** One tile of the Hợp đồng card view. */
export default function ContractCard({ contract }: ContractCardProps) {
  return (
    <EntityListCard
      header={
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate leading-tight font-semibold">
                {contract.contractNumber}
              </h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                <Calendar className="size-2.5" />
                Ký: {formatDate(contract.startDate)}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <StatusBadge
              config={contractStatusConfig[contract.status]}
              isCompact
            />
            <ContractRowActions contract={contract} side="top" />
          </div>
        </CardHeader>
      }
      content={
        <CardContent className="pt-4">
          <dl className="bg-muted/30 ring-border/50 space-y-3 rounded-xl p-3 text-sm ring-1">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                <User className="size-3.5" />
                Người thuê
              </dt>
              <dd className="font-semibold">{contract.tenant}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                <Home className="size-3.5" />
                Phòng
              </dt>
              <dd className="font-semibold">{contract.room}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                <Calendar className="size-3.5" />
                Thời hạn
              </dt>
              <dd className="text-muted-foreground text-xs font-medium">
                {formatDate(contract.startDate)} -{" "}
                {formatDate(contract.endDate)}
              </dd>
            </div>
          </dl>

          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-dashed pt-3">
            <div className="space-y-1">
              <dt className="text-muted-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Landmark className="text-primary/70 size-2.5" />
                Tiền thuê
              </dt>
              <dd className="text-primary text-sm font-bold">
                {formatCurrency(contract.rentAmount)}
              </dd>
            </div>
            <div className="space-y-1 border-l pl-4">
              <dt className="text-muted-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase">
                <Landmark className="size-2.5 text-success/70" />
                Tiền cọc
              </dt>
              <dd className="text-foreground/80 text-sm font-bold">
                {formatCurrency(contract.depositAmount)}
              </dd>
            </div>
          </dl>
        </CardContent>
      }
    />
  );
}
