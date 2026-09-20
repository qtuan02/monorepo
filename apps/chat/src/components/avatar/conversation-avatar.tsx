import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";

import { getInitials } from "~/utils/display";

interface ConversationAvatarProps {
  title: string;
  avatarUrl?: string;
  /** Presence: the Messenger-style dot, omitted entirely when not online. */
  online?: boolean;
  /** Size/ring overrides — the Details panel's 88px header avatar. */
  className?: string;
}

/** Shared by the conversation list row and the panel header. */
export function ConversationAvatar({
  title,
  avatarUrl,
  online,
  className,
}: ConversationAvatarProps) {
  const { t } = useTranslation();

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback>{getInitials(title)}</AvatarFallback>
      {online && (
        <AvatarBadge
          aria-label={t("chat.common.onlineLabel")}
          className="bg-online"
        />
      )}
    </Avatar>
  );
}
