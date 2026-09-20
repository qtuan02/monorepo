import type { ReactNode } from "react";
import { AtSign, CalendarDays, Mail, Phone, Text } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ChatUserInfo } from "@monorepo/types/chat-user";
import { FriendStatus } from "@monorepo/types/chat-friend";
import { Badge } from "@monorepo/ui/components/badge";
import { cn } from "@monorepo/ui/utils/cn";

import { ConversationAvatar } from "~/components/avatar/conversation-avatar";
import { formatDate } from "~/utils/date";
import { getDisplayName } from "~/utils/display";

/** Built at render time — a module-scope map can't call `t()`. */
function useFriendStatusLabel(): Partial<Record<FriendStatus, string>> {
  const { t } = useTranslation();
  return {
    [FriendStatus.FRIEND]: t("chat.common.statusFriend"),
    [FriendStatus.SENT]: t("chat.common.statusSent"),
    [FriendStatus.RECEIVED]: t("chat.common.statusReceived"),
    [FriendStatus.SELF]: t("chat.common.you"),
  };
}

interface UserInfoProps {
  user: ChatUserInfo;
  online?: boolean;
  /** What the `<h2>` renders as — a `DialogTitle` inside a dialog, so the
   * dialog is labelled by the name, or the default heading anywhere else. */
  renderTitle?: (name: string) => ReactNode;
  className?: string;
}

interface UserInfoRowProps {
  icon: ReactNode;
  label: string;
  value?: string | null;
}

/** Every row renders, with a dash where the profile left the field blank —
 * a reader scanning two profiles sees the same list on both. */
function UserInfoRow({ icon, label, value }: UserInfoRowProps) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground flex items-center gap-2 text-xs [&>svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "pl-5.5 text-sm break-words whitespace-pre-wrap",
          !value && "text-muted-foreground",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

/**
 * Someone's profile as a read-only block — avatar, name, relationship, and
 * every field `GET /v1/user/info` returns, in one fixed order. Presentational
 * only: the caller fetches (see `UserDetailDialog`) and decides the frame,
 * so the same block can sit in a dialog, a sheet or a page.
 */
export function UserInfo({
  user,
  online,
  renderTitle,
  className,
}: UserInfoProps) {
  const { t } = useTranslation();
  const displayName = getDisplayName(user);
  const statusLabel = useFriendStatusLabel()[user.statusFriend];

  return (
    <div className={cn("grid gap-5", className)}>
      {/* One horizontal header: avatar beside a two-line text block — the
          relationship badge sits on the name's line and presence on the
          username's, so neither adds a row of its own. */}
      <div className="flex items-center gap-4">
        <ConversationAvatar
          title={displayName}
          avatarUrl={user.avatarUrl ?? undefined}
          online={online}
          className="ring-primary/20 ring-offset-background size-16 shrink-0 ring-4 ring-offset-2"
        />
        <div className="grid min-w-0 gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            {renderTitle ? (
              renderTitle(displayName)
            ) : (
              <h2 className="truncate text-lg font-semibold">{displayName}</h2>
            )}
            {statusLabel && (
              <Badge variant="secondary" className="shrink-0">
                {statusLabel}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="truncate">@{user.username}</span>
            {online && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs">
                <span className="bg-online inline-block size-1.5 rounded-full" />
                {t("chat.common.activeNow")}
              </span>
            )}
          </p>
        </div>
      </div>

      <dl className="bg-muted/40 grid gap-3 rounded-xl p-3">
        <UserInfoRow
          icon={<AtSign />}
          label={t("chat.common.username")}
          value={user.username}
        />
        <UserInfoRow
          icon={<Mail />}
          label={t("chat.common.email")}
          value={user.email}
        />
        <UserInfoRow
          icon={<Phone />}
          label={t("chat.common.phone")}
          value={user.phone}
        />
        <UserInfoRow
          icon={<Text />}
          label={t("chat.common.bio")}
          value={user.bio}
        />
        <UserInfoRow
          icon={<CalendarDays />}
          label={t("chat.common.joined")}
          value={user.joinedAt ? formatDate(user.joinedAt) : null}
        />
      </dl>
    </div>
  );
}
