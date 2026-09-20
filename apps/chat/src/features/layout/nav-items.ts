import type { LucideIcon } from "lucide-react";
import { MessageCircle, UserRound, Users } from "lucide-react";

import { ROUTES } from "~/constants/routes";

export type NavItemKey = "chats" | "friends" | "profile";

interface NavItemDef {
  key: NavItemKey;
  to: string;
  icon: LucideIcon;
  /** The Rail's own label (brief §3.1) — a `chat.nav.*` message key. */
  railLabel: string;
  /** The Bottom nav's — "Me" rather than "Profile" (decision #10). */
  bottomLabel: string;
}

/** The three destinations, shared by `NavRail` and `BottomNav` so the route/icon/order can't drift between them. */
export const NAV_ITEMS: NavItemDef[] = [
  {
    key: "chats",
    to: ROUTES.HOME,
    icon: MessageCircle,
    railLabel: "chat.nav.chats",
    bottomLabel: "chat.nav.chats",
  },
  {
    key: "friends",
    to: ROUTES.FRIENDS,
    icon: Users,
    railLabel: "chat.nav.friends",
    bottomLabel: "chat.nav.friends",
  },
  {
    key: "profile",
    to: ROUTES.PROFILE,
    icon: UserRound,
    railLabel: "chat.nav.profile",
    bottomLabel: "chat.nav.me",
  },
];
