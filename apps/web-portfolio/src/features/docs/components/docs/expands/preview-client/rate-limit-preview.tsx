"use client";

import { Button } from "@web/web-ui/shadcn-ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const RateLimitPreview = () => {
  const [loading, setLoading] = useState(false);
  const [resMessage, setResMessage] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <p>
        Try to send 3 requests in 1 minute. The rate limit is 2 requests per
        minute.
      </p>
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
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Send request"
        )}
      </Button>
      <span className="text-red-500">{resMessage}</span>
    </div>
  );
};

export default RateLimitPreview;
