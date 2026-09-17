interface UtilityDetailTemplateProps {
  utilityId: string;
}

// Placeholder until the slice is ported: heading + the id the route resolved.
export default function UtilityDetailTemplate({
  utilityId,
}: UtilityDetailTemplateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Chi tiết chỉ số điện nước
      </h1>
      <p className="text-muted-foreground text-sm">{utilityId}</p>
    </div>
  );
}
