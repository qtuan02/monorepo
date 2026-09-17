import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { DashboardActivity } from "~/types/dashboard";

interface RecentActivitiesCardProps {
  activities: DashboardActivity[];
}

/** "Hoạt động gần đây": a dotted timeline of the last few events. */
export default function RecentActivitiesCard({
  activities,
}: RecentActivitiesCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-3">
              <div
                className="bg-primary/60 mt-1 size-2 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight font-medium">
                  {activity.action}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {activity.detail}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-[11px]">
                {activity.time}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
