interface SupplierBillDetailTemplateProps {
  billId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function SupplierBillDetailTemplate({
  billId,
}: SupplierBillDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Chi tiết hóa đơn nhà cung cấp
      </h1>
      <p className="text-muted-foreground text-sm">{billId}</p>
    </div>
  );
}
