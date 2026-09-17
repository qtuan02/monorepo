interface TenantDetailTemplateProps {
  tenantId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function TenantDetailTemplate({
  tenantId,
}: TenantDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chi tiết khách thuê</h1>
      <p className="text-muted-foreground text-sm">{tenantId}</p>
    </div>
  );
}
