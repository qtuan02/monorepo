import type { ReactNode } from "react";

interface ExceptionStateProps {
  title: string;
  message: string;
  /** The way out — a reload button, a link home. Optional: the framework's own
   *  status line has nothing useful to offer. */
  action?: ReactNode;
  /** Fills the viewport. For a boundary that replaces the whole shell (root's);
   *  a screen rendered inside the shell leaves it off, since `BodyTemplate`
   *  already owns the column. */
  fullscreen?: boolean;
}

/**
 * The shared anatomy of every exception screen: heading, one line of prose, one
 * action. It exists so the error boundary and the catch-all 404 cannot
 * drift into two different layouts, and so a new exception screen is a title and
 * a message rather than a new page design.
 *
 * Server-rendered like everything else here — it takes strings, so the caller
 * decides which i18next instance translated them.
 */
export function ExceptionState({
  title,
  message,
  action,
  fullscreen,
}: ExceptionStateProps) {
  return (
    <div
      className={
        fullscreen
          ? "flex min-h-dvh flex-col items-center justify-center gap-4 p-4"
          : "flex flex-col items-center justify-center gap-4 py-20 max-md:px-4"
      }
    >
      <h1 className="text-foreground text-center text-3xl font-bold md:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-lg text-center">{message}</p>
      {action}
    </div>
  );
}
