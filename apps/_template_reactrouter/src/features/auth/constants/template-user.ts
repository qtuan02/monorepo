import type { SessionUser } from "~/types/session-user";

/**
 * The one user this Template can sign in as. There is no auth backend here, so
 * the sign-in action mints a session for this fixed user instead of looking one
 * up — it stands in for the value a real credential check would return.
 *
 * The name is a literal rather than a catalogue key because it is data, not
 * copy: it travels inside the cookie and reads the same in every language,
 * which is also what lets an E2E spec assert it off the raw document.
 */
export const TEMPLATE_USER: SessionUser = {
  id: "template-user",
  name: "Nguyễn Văn A",
};
