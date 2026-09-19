import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";

function getInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

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
  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback>{getInitials(title)}</AvatarFallback>
      {online && <AvatarBadge aria-label="Online" className="bg-online" />}
    </Avatar>
  );
}
