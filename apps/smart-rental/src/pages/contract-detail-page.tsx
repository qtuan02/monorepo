import { useParams } from "react-router";

import ContractDetailTemplate from "~/features/contracts/templates/contract-detail.template";

export default function ContractDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { contractId } = useParams() as { contractId: string };

  return <ContractDetailTemplate contractId={contractId} />;
}
