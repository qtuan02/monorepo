interface ContractRenewTemplateProps {
  contractId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function ContractRenewTemplate({
  contractId,
}: ContractRenewTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Gia hạn hợp đồng</h1>
      <p className="text-muted-foreground text-sm">{contractId}</p>
    </div>
  );
}
