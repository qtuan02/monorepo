import { useEffect, useState } from "react";

/**
 * Detects if the code is running on the client (browser) side.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
