/**
 * A snippet painted by hand: plain text, or a run of it named for the colour
 * it takes. Built at the call site rather than by a highlighter — every
 * snippet on this site is a handful of lines, so the three kinds below are the
 * whole grammar. `CodeBlock` joins the runs back into the string a reader
 * copies, so what is copied is exactly what is shown, by construction.
 */
export type CodeTokenKind = "keyword" | "string" | "comment";

export type CodeToken = string | { kind: CodeTokenKind; text: string };
