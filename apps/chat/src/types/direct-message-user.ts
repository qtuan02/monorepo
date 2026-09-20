/**
 * The minimal identity needed to open or draft a direct message with
 * someone — shared by `~/hooks/api/conversation` (which reads it to look up
 * an existing conversation) and the `conversation` feature's Draft
 * conversation util (which reads it back off router state). Living in
 * `~/types` keeps it a downward import for both (see .agents/rules/
 * architecture-circular-dependencies.md).
 */
export interface DirectMessageUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}
