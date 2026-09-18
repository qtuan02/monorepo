import { useParams } from "react-router";

import CycleTemplate from "~/features/cycles/templates/cycle.template";

export default function CyclePage() {
  // Declared on the route path, so it is always present when this page renders.
  const { month } = useParams() as { month: string };

  return <CycleTemplate month={month} />;
}
