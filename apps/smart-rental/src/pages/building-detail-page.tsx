import { useParams } from "react-router";

import BuildingDetailTemplate from "~/features/buildings/templates/building-detail.template";

export default function BuildingDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { buildingId } = useParams() as { buildingId: string };

  return <BuildingDetailTemplate buildingId={buildingId} />;
}
