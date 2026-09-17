interface RoomDetailTemplateProps {
  roomId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function RoomDetailTemplate({
  roomId,
}: RoomDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chi tiết phòng</h1>
      <p className="text-muted-foreground text-sm">{roomId}</p>
    </div>
  );
}
