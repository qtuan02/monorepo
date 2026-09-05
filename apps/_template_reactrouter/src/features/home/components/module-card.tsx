import { href, Link } from "react-router";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { HomeModuleId } from "~/features/home/types/home-module";
import { moduleIcons } from "~/features/home/constants/module-icons";

interface ModuleCardProps {
  id: HomeModuleId;
  title: string;
  description: string;
  comingSoon?: boolean;
}

/**
 * One launcher card. Unlike the Next Template's card, an unbuilt module is
 * STILL a link here: `/modules/:slug` is a public URL for every catalogue
 * entry, and its page is where "not built yet" is said — so the card only has
 * to look muted, never to go dead.
 *
 * `href("/modules/:slug", { slug })` rather than a path string in props: the
 * path table is `src/routes.ts`, typegen types the call, and a renamed route is
 * a compile error on this line instead of a 404 on every card.
 */
export default function ModuleCard({
  id,
  title,
  description,
  comingSoon,
}: ModuleCardProps) {
  const Icon = moduleIcons[id];

  return (
    // The link is the outer element: it owns the rounded corners and the focus
    // ring, and is the card's only Tab stop — the click area and the keyboard
    // focus area are the same element, not two overlapping ones.
    <Link
      to={href("/modules/:slug", { slug: id })}
      className="focus-visible:border-ring focus-visible:ring-ring/50 block h-full rounded-xl outline-none focus-visible:ring-[3px]"
    >
      <Card className="hover:border-primary/40 h-full gap-0 py-5 transition-shadow hover:shadow-md">
        <CardHeader className="px-5">
          <div className="bg-accent text-accent-foreground mb-3 flex size-11 items-center justify-center rounded-lg">
            <Icon className="size-5.5" />
          </div>
          {/* `CardTitle` renders a plain div, so the heading element is spelled
              out here: without it, a module name is not reachable by
              heading-role navigation. The home page's <h1> is the Template
              title and the catalogue section carries the <h2>, so each card
              sits at <h3>. */}
          <CardTitle className="text-base">
            <h3 className={comingSoon ? "text-muted-foreground" : undefined}>
              {title}
            </h3>
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
