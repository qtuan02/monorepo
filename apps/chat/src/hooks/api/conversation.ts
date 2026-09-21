import type {
  InfiniteData,
  QueryClient,
  QueryKey,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { ChatConversationPage } from "@monorepo/api/chat/conversation-service";
import type {
  ChatConversationRecord,
  ChatConversationType,
  ChatCreateGroupParams,
  ChatGroupMembersParams,
  ChatUpdateGroupParams,
} from "@monorepo/types/chat-conversation";
import type {
  ChatConversationRemovedEvent,
  ChatConversationSeenEvent,
  ChatConversationUpdatedEvent,
} from "@monorepo/types/chat-socket";
import { toast } from "@monorepo/ui/components/toast";

import type {
  UseInfiniteQueryOptionsWrapper,
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import { chatConversationService } from "~/libs/http-client";
import i18n from "~/libs/i18n";
import { queryKeysFactory } from "~/libs/query-key-factory";

const CONVERSATIONS_PAGE_LIMIT = 20;

const conversationQueryKeyFactory = queryKeysFactory("conversation");

export const conversationQueryKeys = {
  ...conversationQueryKeyFactory,
};

type ConversationInfiniteData = InfiniteData<
  ChatConversationPage,
  string | undefined
>;

/**
 * Patches whichever page currently holds `conversationId`, in place. Used
 * only where the record is already known to exist client-side (marking a
 * conversation seen, patching in a read receipt) — an event that can also
 * name a conversation the list has never loaded goes through
 * `upsertConversationInCache` below instead.
 */
function updateConversationInPlace(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
  updater: (conversation: ChatConversationRecord) => ChatConversationRecord,
): ConversationInfiniteData | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation,
      ),
    })),
  };
}

/**
 * Replaces the record where it already sits, or inserts it onto the first
 * (newest) page when it's missing entirely — a brand-new conversation (a
 * stranger's first message, being added to a group) so appears with no
 * reload (contract §5). `useConversationList` already re-sorts by
 * `lastMessageAt` on every render, so landing on page 0 is enough for the
 * sidebar to place it correctly.
 */
function upsertConversationInCache(
  data: ConversationInfiniteData | undefined,
  conversation: ChatConversationRecord,
): ConversationInfiniteData | undefined {
  if (!data) return data;

  const isPresent = data.pages.some((page) =>
    page.items.some((item) => item.id === conversation.id),
  );

  if (isPresent) {
    return updateConversationInPlace(data, conversation.id, () => conversation);
  }

  const [firstPage, ...restPages] = data.pages;
  if (!firstPage) return data;

  return {
    ...data,
    pages: [
      { ...firstPage, items: [conversation, ...firstPage.items] },
      ...restPages,
    ],
  };
}

function removeConversationFromCache(
  data: ConversationInfiniteData | undefined,
  conversationId: string,
): ConversationInfiniteData | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== conversationId),
    })),
  };
}

/** The `{ type: "GROUP" }` a list query key carries, if it's the "Groups"
 * chip's own cache entry rather than the default (all-conversations) one —
 * see `queryKeysFactory`'s `list()` shape. */
function listTypeFilterOf(
  queryKey: QueryKey,
): ChatConversationType | undefined {
  const extra = queryKey[2] as
    | { query?: { type?: ChatConversationType } }
    | undefined;
  return extra?.query?.type;
}

interface ConversationUpdateOptions {
  /** Overrides the event's own count — used to clear it for the conversation currently open on screen. */
  unreadCount?: number;
}

/**
 * `conversation.updated` — upserts the whole record into every cached list
 * it belongs in. A type-filtered list (the "Groups" chip) only ever
 * receives a matching conversation, so a direct message never gets inserted
 * into it just because both share the same `lists()` prefix.
 */
export function applyConversationUpdateToCache(
  queryClient: QueryClient,
  event: ChatConversationUpdatedEvent,
  options: ConversationUpdateOptions = {},
) {
  const conversation: ChatConversationRecord =
    options.unreadCount === undefined
      ? event.conversation
      : { ...event.conversation, unreadCount: options.unreadCount };

  for (const [queryKey] of queryClient.getQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
  )) {
    const typeFilter = listTypeFilterOf(queryKey);
    if (typeFilter && typeFilter !== conversation.type) continue;

    queryClient.setQueryData<ConversationInfiniteData>(queryKey, (data) =>
      upsertConversationInCache(data, conversation),
    );
  }
}

/** `conversation.removed` — kicked, left, or the group itself was deleted;
 * either way the record no longer belongs to any of the caller's lists. */
export function applyConversationRemovedToCache(
  queryClient: QueryClient,
  event: ChatConversationRemovedEvent,
) {
  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) => removeConversationFromCache(data, event.conversationId),
  );
}

/** `conversation.seen` — the read receipt of whoever just saw the conversation. */
export function applyConversationSeenToCache(
  queryClient: QueryClient,
  event: ChatConversationSeenEvent,
  currentUserId?: string,
) {
  queryClient.setQueriesData<ConversationInfiniteData>(
    { queryKey: conversationQueryKeys.lists() },
    (data) =>
      updateConversationInPlace(data, event.conversationId, (conversation) => ({
        ...conversation,
        unreadCount:
          event.seenByUserId === currentUserId ? 0 : conversation.unreadCount,
        participants: conversation.participants.map((participant) =>
          participant.userId === event.seenByUserId
            ? {
                ...participant,
                lastReadMessageId: event.lastReadMessageId,
                lastReadAt: event.lastReadAt,
              }
            : participant,
        ),
      })),
  );
}

export function useMarkConversationAsSeenMutation(
  options?: UseMutationOptionsWrapper<string, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatConversationService.markAsSeen(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.setQueriesData<ConversationInfiniteData>(
        { queryKey: conversationQueryKeys.lists() },
        (data) =>
          updateConversationInPlace(data, conversationId, (conversation) => ({
            ...conversation,
            unreadCount: 0,
          })),
      );
      // The deep-link entry (`useGetConversation`) is not a list page, so
      // the loop above never reaches it.
      queryClient.setQueryData<ChatConversationRecord>(
        conversationQueryKeys.detail(conversationId),
        (conversation) =>
          conversation ? { ...conversation, unreadCount: 0 } : conversation,
      );
    },
    ...options,
  });
}

/**
 * `type` is undefined for the default (all-conversations) list and `GROUP`
 * for the list's "Groups" chip — passed to the key factory's own `query`
 * slot so the two live under distinct cache entries (T2, brief §10 row 15):
 * a group's row loaded only through the Groups chip must not be mistaken
 * for a page of the default list, and invalidating one must not silently
 * refetch the other under a shared key.
 */
export function useConversationsInfiniteQuery(
  type?: ChatConversationType,
  options?: UseInfiniteQueryOptionsWrapper<
    ChatConversationPage,
    Error,
    ChatConversationRecord[],
    readonly unknown[],
    string | undefined
  >,
): UseInfiniteQueryResult<ChatConversationRecord[], Error> {
  return useInfiniteQuery<
    ChatConversationPage,
    Error,
    ChatConversationRecord[],
    readonly unknown[],
    string | undefined
  >({
    queryKey: conversationQueryKeys.list(type ? { type } : undefined),
    queryFn: ({ pageParam }) =>
      chatConversationService.getConversations({
        limit: CONVERSATIONS_PAGE_LIMIT,
        cursor: pageParam,
        type,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    // Flattened here, not by the caller — see .agents/rules/tanstack-consume-infinite.md.
    select: (data) => data.pages.flatMap((page) => page.items),
    ...options,
  });
}

/**
 * The deep-link/reload fallback: `ConversationPanel` looks the conversation
 * up in the list cache first, and only calls this when it's missing (a
 * fresh `/conversations/:id` load, or a mobile session with no list ever
 * mounted). Its own `detail(id)` cache entry, never written back into a
 * `lists()` page — a socket `conversation.updated` upserts those
 * independently.
 */
export function useGetConversation(
  conversationId: string | undefined,
  options?: UseQueryOptionsWrapper<ChatConversationRecord>,
): UseQueryResult<ChatConversationRecord, Error> {
  return useQuery<ChatConversationRecord, Error>({
    queryKey: conversationQueryKeys.detail(conversationId ?? ""),
    queryFn: () =>
      chatConversationService.getConversation(conversationId as string),
    enabled: !!conversationId && (options?.enabled ?? true),
    ...options,
  });
}

// The four group writes below all invalidate the whole conversation list
// rather than patching one record in place — unlike the socket-driven
// helpers above, each already holds the full updated record from its own
// response, but a group write also changes `participants`, which several
// other cached reads (the details panel, the member picker's disabled set)
// derive from — see .agents/rules/tanstack-consume-mutation.md.

export function useCreateGroupMutation(
  options?: UseMutationOptionsWrapper<
    ChatCreateGroupParams,
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ChatCreateGroupParams) =>
      chatConversationService.createGroup(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: i18n.t("chat.group.toast.created"), type: "success" });
    },
    ...options,
  });
}

export function useUpdateGroupMutation(
  options?: UseMutationOptionsWrapper<
    { conversationId: string; params: ChatUpdateGroupParams },
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      params,
    }: {
      conversationId: string;
      params: ChatUpdateGroupParams;
    }) => chatConversationService.updateGroup(conversationId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: i18n.t("chat.group.toast.renamed"), type: "success" });
    },
    ...options,
  });
}

export function useAddGroupMembersMutation(
  options?: UseMutationOptionsWrapper<
    { conversationId: string; params: ChatGroupMembersParams },
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      params,
    }: {
      conversationId: string;
      params: ChatGroupMembersParams;
    }) => chatConversationService.addMembers(conversationId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({
        title: i18n.t("chat.group.toast.membersAdded"),
        type: "success",
      });
    },
    ...options,
  });
}

export function useRemoveGroupMemberMutation(
  options?: UseMutationOptionsWrapper<
    { conversationId: string; memberId: string },
    ChatConversationRecord
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      memberId,
    }: {
      conversationId: string;
      memberId: string;
    }) => chatConversationService.removeMember(conversationId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({
        title: i18n.t("chat.group.toast.memberRemoved"),
        type: "success",
      });
    },
    ...options,
  });
}

export function useLeaveGroupMutation(
  options?: UseMutationOptionsWrapper<string, void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatConversationService.leave(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.all });
      toast.add({ title: i18n.t("chat.group.toast.left"), type: "success" });
    },
    ...options,
  });
}
