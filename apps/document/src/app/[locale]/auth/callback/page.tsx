"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import type { OAuthMessage } from "~/types/oauth";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const isPopup = searchParams.get("popup") === "true";
    const error = searchParams.get("error");
    const redirectTo = searchParams.get("redirect") || "/";

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

      // Wait a bit for session to be set and ensure DOM is ready
      const sendMessage = () => {
        const message: OAuthMessage = error
          ? {
              type: "OAUTH_ERROR",
              error,
            }
          : {
              type: "OAUTH_SUCCESS",
            };

        // Send message to parent window multiple times to ensure it's received
        if (window.opener && !window.opener.closed) {
          try {
            // Send message immediately
            window.opener.postMessage(message, window.location.origin);
            
            // Send again after a short delay as backup
            setTimeout(() => {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(message, window.location.origin);
              }
            }, 100);

            // Close popup after ensuring message is sent
            setTimeout(() => {
              window.close();
            }, 300);
          } catch (err) {
            // If postMessage fails, try to close anyway
            console.error("Failed to send message to opener:", err);
            window.close();
          }
        } else {
          // No opener, just close
          window.close();
        }
      };

      // Use requestAnimationFrame to ensure DOM is ready, then wait a bit for session
      requestAnimationFrame(() => {
        setTimeout(sendMessage, 500);
      });
    } else {
      // If not in popup and no popup flag, redirect normally
      // But only if this is not opened from a popup context
      window.location.href = redirectTo;
    }
  }, [searchParams]);

  return (
    <div className="flex-center h-screen w-screen">
      <div className="text-center">
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
