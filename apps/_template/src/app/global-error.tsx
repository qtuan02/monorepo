"use client";

// import { useEffect } from "react";
import NextError from "next/error";

// import * as Sentry from "@sentry/nextjs";

interface Props {
  error: Error & { digest?: string };
}
export default function GlobalError(props: Props) {
  console.error(props.error);
  //   useEffect(() => {
  //     Sentry.captureException(error);
  //   }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
