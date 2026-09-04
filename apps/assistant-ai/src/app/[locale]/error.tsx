"use client";

import InternalServerError from "~/components/exception/internal-server-error";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * The segment error boundary. Next requires a Client Component here, and hands
 * it React's own `reset` — which re-renders the segment rather than reloading
 * the document, so client state survives a transient failure.
 */
export default function ErrorPage({ reset }: ErrorPageProps) {
  return <InternalServerError reset={reset} />;
}
