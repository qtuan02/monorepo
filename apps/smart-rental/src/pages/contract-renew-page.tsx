import { useParams } from "react-router";

import ContractRenewTemplate from "~/features/contracts/templates/contract-renew.template";

export default function ContractRenewPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { contractId } = useParams() as { contractId: string };

  return <ContractRenewTemplate contractId={contractId} />;
}
