import myUndefinedFunction from "@sentry/nextjs";

export default function SentryErrorPage() {
  // @ts-ignore
  return myUndefinedFunction();
}
