import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  perPath?: boolean;
};

function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim();

  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();

  if ((req as any)?.ip) return (req as any).ip;

  return "127.0.0.1";
}

export function rateLimit(options?: Options) {
  const ttl = options?.interval ?? 60_000;
  const cache = new LRUCache<string, { count: number; exp: number }>({
    max: options?.uniqueTokenPerInterval ?? 500,
    ttl,
  });

  return {
    check: (req: NextRequest, limit: number) => {
      const ip = getClientIp(req);
      if (!ip) {
        throw NextResponse.json({ error: "can not get IP." }, { status: 400 });
      }

      const key = options?.perPath ? `${ip}:${req.nextUrl.pathname}` : ip;

      const now = Date.now();
      const cur = cache.get(key);
      const count = (cur?.count ?? 0) + 1;
      const exp = cur?.exp ?? now + ttl;

      cache.set(key, { count, exp });

      const remaining = Math.max(0, limit - count);
      const resetSeconds = Math.max(0, Math.ceil((exp - now) / 1000));

      if (count > limit) {
        const res = NextResponse.json(
          { error: "Too many requests, please try again later." },
          { status: 429 },
        );
        res.headers.set("X-RateLimit-Limit", String(limit));
        res.headers.set("X-RateLimit-Remaining", "0");
        res.headers.set("X-RateLimit-Reset", String(resetSeconds));
        throw res;
      }

      return { limit, remaining, reset: resetSeconds };
    },
  };
}
