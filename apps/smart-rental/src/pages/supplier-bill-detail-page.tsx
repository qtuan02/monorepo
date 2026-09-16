import { useParams } from "react-router";

import SupplierBillDetailTemplate from "~/features/supplier-bills/templates/supplier-bill-detail.template";

export default function SupplierBillDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { billId } = useParams() as { billId: string };

  return <SupplierBillDetailTemplate billId={billId} />;
}
