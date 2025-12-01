import type React from "react";
import {
  ArrowUpIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui";
import { cn } from "@monorepo/ui/libs/cn";

interface StatCardProps {
  title: string;
  description: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  lastMonthText: string;
}

function StatCard({
  title,
  description,
  value,
  change,
  trend,
  icon: Icon,
  lastMonthText,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        <div className="mt-4 flex items-center text-xs">
          <span
            className={cn(
              "flex items-center gap-1 font-medium",
              trend === "up" ? "text-green-600" : "text-red-600",
            )}
          >
            {trend === "up" ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <TrendingUpIcon className="h-3 w-3" />
            )}
            {change}
          </span>
          <span className="text-muted-foreground ml-1">{lastMonthText}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomeTemplate() {
  const t = useTranslations("Dashboard");

  const stats = [
    {
      title: t("total_revenue"),
      description: t("revenue_description"),
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up" as const,
      icon: DollarSignIcon,
    },
    {
      title: t("subscriptions"),
      description: t("subscriptions_description"),
      value: "+2350",
      change: "+180.1%",
      trend: "up" as const,
      icon: UsersIcon,
    },
    {
      title: t("sales"),
      description: t("sales_description"),
      value: "+12,234",
      change: "+19%",
      trend: "up" as const,
      icon: ShoppingCartIcon,
    },
    {
      title: t("active_now"),
      description: t("active_description"),
      value: "+573",
      change: "+201",
      trend: "up" as const,
      icon: TrendingUpIcon,
    },
  ];

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("overview")}
            </h2>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                {...stat}
                lastMonthText={t("last_month")}
              />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t("overview")}</CardTitle>
                <CardDescription>{t("recent_activity")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="text-muted-foreground flex h-[300px] items-center justify-center"
                  aria-label="Chart placeholder"
                >
                  Chart placeholder
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t("recent_activity")}</CardTitle>
                <CardDescription>{t("sales_description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" role="list">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-lg border p-3"
                      role="listitem"
                      aria-label="Activity item"
                    >
                      <div
                        className="bg-muted h-10 w-10 rounded-full"
                        aria-hidden="true"
                      />
                      <div className="flex-1 space-y-1" aria-hidden="true">
                        <div className="bg-muted h-4 w-32 rounded" />
                        <div className="bg-muted/50 h-3 w-24 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
