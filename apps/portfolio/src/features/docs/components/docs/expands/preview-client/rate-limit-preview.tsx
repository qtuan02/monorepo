"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@monorepo/ui/shadcn-ui/button";

const RateLimitPreview = () => {
  const [loading, setLoading] = useState(false);
  const [resMessage, setResMessage] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <p>Try to send 3 requests in 1 minute. (Handle in Server of Next.js)</p>
      <Button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setResMessage("");
          try {
            const res = await fetch("/api/rate-limit");
            if (res.status !== 200) {
              const errRes = await res.json();
              setResMessage(errRes.error);
              return;
            }
            const data = await res.json();

            setResMessage(data.message);
          } catch (err) {
            setResMessage(JSON.stringify(err));
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Send request"
        )}
      </Button>
      <span className="text-red-500">{resMessage}</span>
    </div>
  );
};

export default RateLimitPreview;
