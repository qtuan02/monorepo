import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { IconComponent } from "~/features/home/types/home-module";
import { Link } from "~/i18n/navigation";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: IconComponent;
  href: string;
  comingSoon?: boolean;
}

export default function ModuleCard({
  title,
  description,
  icon,
  href,
  comingSoon,
}: ModuleCardProps) {
  const Icon = icon;

  const card = (
    <Card className="h-full gap-0 py-5 transition-shadow hover:border-primary/40 hover:shadow-md">
      <CardHeader className="px-5">
        <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5.5" />
        </div>
        {/* `CardTitle` renders a plain div, so the heading element is spelled
            out here: without it, a module name is not reachable by heading-role
            navigation. The page's own <h1> is the launcher title, so each card
            sits one level below it. */}
        <CardTitle className="text-base">
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );

  // A card for a screen that does not exist yet is not a link. A dead link is
  // worse than plain text: it promises a destination and delivers a 404.
  if (comingSoon) {
    return <div className="h-full opacity-60">{card}</div>;
  }

  return (
    // The link is the outer element: it owns the rounded corners and the focus
    // ring, and is the card's only Tab stop — the click area and the keyboard
    // focus area are the same element, not two overlapping ones.
    <Link
      href={href}
      className="block h-full rounded-xl outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {card}
    </Link>
  );
}
