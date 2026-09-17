interface BuildingDetailTemplateProps {
  buildingId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function BuildingDetailTemplate({
  buildingId,
}: BuildingDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Chi tiết tòa nhà</h1>
      <p className="text-muted-foreground text-sm">{buildingId}</p>
    </div>
  );
}
