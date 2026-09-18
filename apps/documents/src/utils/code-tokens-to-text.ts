import type { CodeToken } from "~/types/code-token";

/** The plain text of a snippet — what the copy button hands the clipboard. */
export function codeTokensToText(code: string | readonly CodeToken[]): string {
  if (typeof code === "string") return code;

  return code
    .map((token) => (typeof token === "string" ? token : token.text))
    .join("");
}
