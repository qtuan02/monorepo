import type { LucideIcon } from "lucide-react";
import { Loader2, LogOut, PencilLine, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

interface GroupActionsProps {
  isCurrentUserAdmin: boolean;
  isRenameGroupSubmitting: boolean;
  isLeaveGroupSubmitting: boolean;
  onRenameClick: () => void;
  onAddMembersClick: () => void;
  onLeaveGroupClick: () => void;
}

interface GroupActionButtonProps {
  icon: LucideIcon;
  /** Shown under the icon at rest. */
  shortLabel: string;
  /** The tooltip on hover, and the accessible name — unambiguous even
   * though the caption on screen is abbreviated. */
  fullLabel: string;
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
  destructive?: boolean;
}

/** A circular icon button with a short caption underneath and the full
 * label as a hover tooltip (Messenger's shape for a profile panel's
 * actions) — centers on its own whether it's the only action showing (a
 * member's Leave) or one of a set (an admin's Rename + Add + Leave). */
function GroupActionButton({
  icon: Icon,
  shortLabel,
  fullLabel,
  onClick,
  disabled,
  pending,
  destructive,
}: GroupActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={fullLabel}
            className="group flex w-14 flex-col items-center gap-1.5 outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <span
              className={cn(
                "grid size-11 place-items-center rounded-full transition-colors group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                destructive
                  ? "bg-destructive/10 text-destructive group-hover:bg-destructive/20"
                  : "bg-secondary text-secondary-foreground group-hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
              )}
            >
              {pending ? (
                <Loader2 className="size-4.5 animate-spin" />
              ) : (
                <Icon className="size-4.5" />
              )}
            </span>
            <span
              className={cn(
                "text-center text-xs leading-tight font-medium",
                destructive ? "text-destructive" : "text-foreground",
              )}
            >
              {shortLabel}
            </span>
          </button>
        }
      />
      <TooltipContent>{fullLabel}</TooltipContent>
    </Tooltip>
  );
}

/** Rename · Add members · Leave group — one row, icon + short caption,
 * the full word only on hover (story 46/47). Rename and Add members are
 * the owner's only; leaving is open to anyone in the group. */
export function GroupActions({
  isCurrentUserAdmin,
  isRenameGroupSubmitting,
  isLeaveGroupSubmitting,
  onRenameClick,
  onAddMembersClick,
  onLeaveGroupClick,
}: GroupActionsProps) {
  const { t } = useTranslation();

  return (
    <TooltipProvider delay={200}>
      <div className="flex items-start justify-center gap-6">
        {isCurrentUserAdmin && (
          <GroupActionButton
            icon={PencilLine}
            shortLabel={t("chat.group.actions.renameShort")}
            fullLabel={t("chat.group.actions.rename")}
            onClick={onRenameClick}
            disabled={isRenameGroupSubmitting}
            pending={isRenameGroupSubmitting}
          />
        )}
        {isCurrentUserAdmin && (
          <GroupActionButton
            icon={UserPlus}
            shortLabel={t("chat.group.actions.addMembersShort")}
            fullLabel={t("chat.group.actions.addMembers")}
            onClick={onAddMembersClick}
          />
        )}
        <GroupActionButton
          icon={LogOut}
          shortLabel={t("chat.group.actions.leaveGroupShort")}
          fullLabel={
            isLeaveGroupSubmitting
              ? t("chat.group.actions.leaving")
              : t("chat.group.actions.leaveGroup")
          }
          onClick={onLeaveGroupClick}
          disabled={isLeaveGroupSubmitting}
          pending={isLeaveGroupSubmitting}
          destructive
        />
      </div>
    </TooltipProvider>
  );
}
