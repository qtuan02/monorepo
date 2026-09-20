import { describe, expect, it } from "vitest";

import {
  createDraftConversationId,
  getDraftUserFromLocationState,
  isDraftConversationId,
} from "~/utils/direct-message-draft";

const USER = {
  id: "u2",
  username: "lan",
  firstName: "Lan",
  lastName: "Nguyen",
  avatarUrl: null,
};

describe("createDraftConversationId / isDraftConversationId", () => {
  it("builds a draft id from the user id, and recognizes it back", () => {
    const draftId = createDraftConversationId("u2");

    expect(draftId).toBe("draft-u2");
    expect(isDraftConversationId(draftId)).toBe(true);
  });

  it("does not mistake a real conversation id for a draft one", () => {
    expect(isDraftConversationId("c1")).toBe(false);
  });
});

describe("getDraftUserFromLocationState", () => {
  it("reads a valid directMessageDraftUser off router state", () => {
    expect(
      getDraftUserFromLocationState({ directMessageDraftUser: USER }),
    ).toEqual(USER);
  });

  it("returns null when there is no router state at all", () => {
    expect(getDraftUserFromLocationState(null)).toBeNull();
    expect(getDraftUserFromLocationState(undefined)).toBeNull();
  });

  it("returns null when the state carries something else entirely", () => {
    expect(getDraftUserFromLocationState({ somethingElse: true })).toBeNull();
  });

  it("returns null when directMessageDraftUser is missing a required field", () => {
    const { lastName: _lastName, ...incomplete } = USER;

    expect(
      getDraftUserFromLocationState({ directMessageDraftUser: incomplete }),
    ).toBeNull();
  });

  it("accepts a missing avatarUrl", () => {
    const { avatarUrl: _avatarUrl, ...withoutAvatar } = USER;

    expect(
      getDraftUserFromLocationState({
        directMessageDraftUser: withoutAvatar,
      }),
    ).toEqual(withoutAvatar);
  });
});
