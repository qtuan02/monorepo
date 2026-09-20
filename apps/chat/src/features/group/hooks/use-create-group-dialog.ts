import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { CreateGroupFormValues } from "~/features/group/types/create-group-form";
import { createCreateGroupFormSchema } from "~/features/group/types/create-group-form";

interface UseCreateGroupDialogParams {
  isOpen: boolean;
}

/**
 * `useWatch`, never the form's own `watch()` — the latter subscribes the
 * whole dialog to every keystroke and is exactly what makes the React
 * Compiler bail out of memoizing it (see .agents/rules/forms-use-watch.md).
 */
export function useCreateGroupDialog({ isOpen }: UseCreateGroupDialogParams) {
  const { t } = useTranslation();
  // Rebuilt on every language switch — see createCreateGroupFormSchema.
  const schema = React.useMemo(() => createCreateGroupFormSchema(t), [t]);
  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", memberIds: [] },
    mode: "onChange",
  });

  const selectedMemberIds = useWatch({
    control: form.control,
    name: "memberIds",
  });

  React.useEffect(() => {
    if (!isOpen) form.reset({ name: "", memberIds: [] });
  }, [form, isOpen]);

  return { form, selectedMemberIds };
}
