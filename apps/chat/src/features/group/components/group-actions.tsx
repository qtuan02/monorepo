import { LogOut, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";

interface GroupActionsProps {
  isCurrentUserAdmin: boolean;
  isLeaveGroupSubmitting: boolean;
  onAddMembersClick: () => void;
  onLeaveGroupClick: () => void;
}

/** Add members · Leave group — rename moved inline onto the header's title
 * (see group-panel.template.tsx). Only the owner sees Add members; leaving
 * is open to anyone in the group (story 47). */
export function GroupActions({
  isCurrentUserAdmin,
  isLeaveGroupSubmitting,
  onAddMembersClick,
  onLeaveGroupClick,
}: GroupActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {isCurrentUserAdmin && (
        <Button type="button" variant="secondary" onClick={onAddMembersClick}>
          <UserPlus className="size-4" />
          {t("chat.group.actions.addMembers")}
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onLeaveGroupClick}
        disabled={isLeaveGroupSubmitting}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4" />
        {isLeaveGroupSubmitting
          ? t("chat.group.actions.leaving")
          : t("chat.group.actions.leaveGroup")}
      </Button>
    </div>
  );
}
