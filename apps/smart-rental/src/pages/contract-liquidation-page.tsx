import { useParams } from "react-router";

import ContractLiquidationTemplate from "~/features/contracts/templates/contract-liquidation.template";

export default function ContractLiquidationPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { contractId } = useParams() as { contractId: string };

  return <ContractLiquidationTemplate contractId={contractId} />;
}
