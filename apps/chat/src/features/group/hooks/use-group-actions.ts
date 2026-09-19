import * as React from "react";

import {
  useAddGroupMembersMutation,
  useLeaveGroupMutation,
  useRemoveGroupMemberMutation,
  useUpdateGroupMutation,
} from "~/hooks/api/conversation";

interface UseGroupActionsParams {
  conversationId: string;
  onLeft: () => void;
}

/** The mutation wiring behind `group-panel.template.tsx` — rename, add/remove
 * members, leave. Dialog open state stays local to that template. */
export function useGroupActions({
  conversationId,
  onLeft,
}: UseGroupActionsParams) {
  const [removingMemberId, setRemovingMemberId] = React.useState<string | null>(
    null,
  );

  const renameGroup = useUpdateGroupMutation();
  const addMembers = useAddGroupMembersMutation();
  const removeMember = useRemoveGroupMemberMutation({
    onSettled: () => setRemovingMemberId(null),
  });
  const leaveGroup = useLeaveGroupMutation({ onSuccess: onLeft });

  const handleRenameGroup = (name: string) => {
    renameGroup.mutate({ conversationId, params: { name } });
  };

  const handleAddMembers = (memberIds: string[]) => {
    addMembers.mutate({ conversationId, params: { memberIds } });
  };

  const handleRemoveMember = (memberId: string) => {
    setRemovingMemberId(memberId);
    removeMember.mutate({ conversationId, memberId });
  };

  const handleLeaveGroup = () => {
    leaveGroup.mutate(conversationId);
  };

  return {
    isRenameGroupSubmitting: renameGroup.isPending,
    isAddMembersSubmitting: addMembers.isPending,
    isLeaveGroupSubmitting: leaveGroup.isPending,
    removingMemberId,
    onRenameGroup: handleRenameGroup,
    onAddMembers: handleAddMembers,
    onRemoveMember: handleRemoveMember,
    onLeaveGroup: handleLeaveGroup,
  };
}
