import { useParams } from "react-router";

import TenantDetailTemplate from "~/features/tenants/templates/tenant-detail.template";

export default function TenantDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { tenantId } = useParams() as { tenantId: string };

  return <TenantDetailTemplate tenantId={tenantId} />;
}
