interface ContractDetailTemplateProps {
  contractId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function ContractDetailTemplate({
  contractId,
}: ContractDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chi tiết hợp đồng</h1>
      <p className="text-muted-foreground text-sm">{contractId}</p>
    </div>
  );
}
