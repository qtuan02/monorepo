import { useParams } from "react-router";

import UtilityDetailTemplate from "~/features/utilities/templates/utility-detail.template";

export default function UtilityDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { utilityId } = useParams() as { utilityId: string };

  return <UtilityDetailTemplate utilityId={utilityId} />;
}
