import { Progress } from "@monorepo/ui/components/progress";

interface OccupancyBarProps {
  /** 0–100 */
  rate: number;
  label?: string;
}

/** "Lấp đầy … %" over a progress bar — the card and the detail screen share it. */
export default function OccupancyBar({
  rate,
  label = "Lấp đầy",
}: OccupancyBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {label}
        </span>
        <span className="font-semibold">{rate}%</span>
      </div>
      <Progress value={rate} aria-label={label} />
    </div>
  );
}
