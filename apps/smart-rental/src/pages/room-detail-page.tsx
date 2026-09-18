import { useParams } from "react-router";

import RoomDetailTemplate from "~/features/rooms/templates/room-detail.template";

export default function RoomDetailPage() {
  // Declared on the route path, so it is always present when this page renders.
  const { roomId } = useParams() as { roomId: string };

  return <RoomDetailTemplate roomId={roomId} />;
}
