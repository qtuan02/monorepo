import { Link } from "react-router";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { IconComponent } from "~/features/home/types/home-module";

interface CardItemProps {
  title: string;
  description: string;
  icon: IconComponent;
  navigateTo: string;
}

export default function CardItem(props: CardItemProps) {
  const { title, description, icon, navigateTo } = props;
  const Icon = icon;

  return (
    // The link is the outer element: it owns the rounded corners and the
    // focus ring, and is the card's only Tab stop — the click area and the
    // keyboard focus area are the same element, not two overlapping ones.
    <Link
      to={navigateTo}
      className="focus-visible:border-ring focus-visible:ring-ring/50 block h-full rounded-xl outline-none focus-visible:ring-[3px]"
    >
      <Card className="hover:border-primary/40 h-full gap-0 py-5 transition-shadow hover:shadow-md">
        <CardHeader className="px-5">
          <div className="bg-accent text-accent-foreground mb-3 flex size-11 items-center justify-center rounded-lg">
            <Icon className="size-5.5" />
          </div>
          {/* `CardTitle` renders a plain div, so the heading element is
              spelled out here, same as sign-in-template.tsx: without it, a
              module name isn't reachable via heading-role navigation. The
              page's own <h1> is "Phân hệ" (home-template.tsx), so each card
              is one level below it. */}
          <CardTitle className="text-base">
            <h2>{title}</h2>
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
