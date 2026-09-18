import { useParams } from "react-router";

import InvoiceDetailTemplate from "~/features/invoices/templates/invoice-detail.template";

export default function InvoiceDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { invoiceId } = useParams() as { invoiceId: string };

  return <InvoiceDetailTemplate invoiceId={invoiceId} />;
}
