"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const isPopup = searchParams.get("popup") === "true";

    // Check if this is opened in a popup (has window.opener) OR has popup flag
    if ((window.opener && !window.opener.closed) || isPopup) {
      // If has popup flag but no window.opener, this might be a redirect issue
      // Don't redirect parent window - just close this window
      if (isPopup && !window.opener) {
        // This shouldn't happen, but if it does, just close and don't redirect
        setTimeout(() => {
          window.close();
        }, 100);
        return;
      }

      // Wait a bit for session to be set
      setTimeout(() => {
        const error = searchParams.get("error");

        if (error) {
          // Send error message to parent
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type: "OAUTH_ERROR",
                error: error,
              },
              window.location.origin,
            );
          }
        } else {
          // Send success message to parent
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type: "OAUTH_SUCCESS",
              },
              window.location.origin,
            );
          }
        }

        // Close popup after sending message
        window.close();
      }, 500);
    } else {
      // If not in popup and no popup flag, redirect normally
      // But only if this is not opened from a popup context
      const redirectTo = searchParams.get("redirect") || "/";
      window.location.href = redirectTo;
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
