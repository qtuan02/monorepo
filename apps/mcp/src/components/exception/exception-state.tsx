import type { ReactNode } from "react";

interface ExceptionStateProps {
  title: string;
  message: string;
  /** The way out — a link home, a reload button. Optional: a 404 inside a
   *  dialog has nowhere useful to go. */
  action?: ReactNode;
  /** Fills the viewport. Used by the error boundary, which replaces the shell. */
  fullscreen?: boolean;
}

/**
 * The shared anatomy of every exception screen: heading, one line of prose, one
 * action. It exists so `not-found` and the error boundary cannot drift into two
 * different layouts, and so a new exception screen is a title and a message
 * rather than a new page design.
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
          ? "flex min-h-svh flex-col items-center justify-center gap-4 p-4"
          : "flex flex-col items-center justify-center gap-4 py-20 max-md:px-4"
      }
    >
      <h1 className="text-center text-3xl font-bold text-foreground md:text-4xl">
        {title}
      </h1>
      <p className="max-w-lg text-center text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
