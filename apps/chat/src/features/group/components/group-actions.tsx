import { LogOut, PencilLine, UserPlus } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";

interface GroupActionsProps {
  isLeaveGroupSubmitting: boolean;
  onAddMembersClick: () => void;
  onLeaveGroupClick: () => void;
  onRenameGroupClick: () => void;
}

export function GroupActions({
  isLeaveGroupSubmitting,
  onAddMembersClick,
  onLeaveGroupClick,
  onRenameGroupClick,
}: GroupActionsProps) {
  return (
    <section className="grid gap-2">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        Group actions
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={onRenameGroupClick}>
          <PencilLine className="size-4" />
          Rename group
        </Button>

        <Button type="button" variant="secondary" onClick={onAddMembersClick}>
          <UserPlus className="size-4" />
          Add members
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onLeaveGroupClick}
          disabled={isLeaveGroupSubmitting}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2 sm:justify-center"
        >
          <LogOut className="size-4" />
          {isLeaveGroupSubmitting ? "Leaving..." : "Leave group"}
        </Button>
      </div>
    </section>
  );
}
