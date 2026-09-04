import { HomeIcon } from "lucide-react";

import type { IconComponent } from "~/types/icon";
import { GithubIcon } from "~/components/icons/github-icon";
import { LinkedinIcon } from "~/components/icons/linkedin-icon";
import { ROUTES } from "~/constants/routes";

export interface NavbarItem {
  /** Also the message key: `portfolio.navbar.<id>`. */
  id: string;
  /**
   * An unprefixed app path for an internal item — next-intl's `Link` adds the
   * locale — or a full URL for an external one.
   */
  href: string;
  /** Opens in a new tab and bypasses the locale-aware `Link`. */
  external: boolean;
  icon: IconComponent;
}

/** The dock's links, in the order they sit along the bar. */
export const NAVBAR_ITEMS: readonly NavbarItem[] = [
  { id: "home", href: ROUTES.HOME, external: false, icon: HomeIcon },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/tuan-huynh-916b792b7",
    external: true,
    icon: LinkedinIcon,
  },
  {
    id: "github",
    href: "https://github.com/qtuan02",
    external: true,
    icon: GithubIcon,
  },
];
