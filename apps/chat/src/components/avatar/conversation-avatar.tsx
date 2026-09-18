import {
  Avatar,
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
}

/** Shared by the conversation list row and the panel header. */
export function ConversationAvatar({
  title,
  avatarUrl,
}: ConversationAvatarProps) {
  return (
    <Avatar>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback>{getInitials(title)}</AvatarFallback>
    </Avatar>
  );
}
