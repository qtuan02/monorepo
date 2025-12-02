import { useEffect, useRef } from "react";

import { logger } from "~/utils/logger";
import type { OAuthMessage } from "~/types/oauth";

interface OAuthPopupOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

/**
 * Hook for managing OAuth popup window and message handling
 * @param options - Callback options for popup events
 * @returns Object with openPopup function and cleanup
 */
export function useOAuthPopup(options: OAuthPopupOptions = {}) {
  const popupRef = useRef<Window | null>(null);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(
    null,
  );
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = () => {
    if (messageListenerRef.current) {
      window.removeEventListener("message", messageListenerRef.current);
      messageListenerRef.current = null;
    }

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  };

  const openPopup = (url: string, title = "OAuth Sign In"): boolean => {
    // Clean up any existing popup
    cleanup();

    // Calculate popup position (centered)
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "about:blank",
      title,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,directories=no,status=no`,
    );

    if (!popup) {
      options.onError?.("popup_blocked_error");
      return false;
    }

    popupRef.current = popup;

    // Set up message listener
    const messageListener = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        logger.warn("OAuth popup message from invalid origin", {
          origin: event.origin,
          expected: window.location.origin,
        });
        return;
      }

      const data = event.data as OAuthMessage | unknown;

      // Check if data has the expected structure
      if (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        (data.type === "OAUTH_SUCCESS" || data.type === "OAUTH_ERROR")
      ) {
        const oauthMessage = data as OAuthMessage;
        
        logger.info("OAuth popup received message", { type: oauthMessage.type });
        
        if (oauthMessage.type === "OAUTH_SUCCESS") {
          cleanup();
          // Small delay to ensure cleanup completes
          setTimeout(() => {
            options.onSuccess?.();
          }, 50);
        } else if (oauthMessage.type === "OAUTH_ERROR") {
          cleanup();
          options.onError?.(oauthMessage.error || "sign_in_error");
        }
      }
    };

    messageListenerRef.current = messageListener;
    window.addEventListener("message", messageListener);

    // Navigate popup to OAuth URL
    popup.location.href = url;

    // Check if popup is closed manually
    checkIntervalRef.current = setInterval(() => {
      if (popup.closed) {
        cleanup();
        options.onClose?.();
      }
    }, 500);

    return true;
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    openPopup,
    cleanup,
  };
}

