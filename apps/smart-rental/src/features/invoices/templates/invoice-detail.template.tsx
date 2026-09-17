interface InvoiceDetailTemplateProps {
  invoiceId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function InvoiceDetailTemplate({
  invoiceId,
}: InvoiceDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chi tiết hóa đơn</h1>
      <p className="text-muted-foreground text-sm">{invoiceId}</p>
    </div>
  );
}
