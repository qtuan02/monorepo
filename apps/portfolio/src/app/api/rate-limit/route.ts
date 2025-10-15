import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "~/utils/rate-limit";

const limiter = rateLimit({
  interval: 60_000,
  uniqueTokenPerInterval: 500,
  perPath: true,
});

export async function GET(req: NextRequest) {
  try {
    const info = limiter.check(req, 3);
    const res = NextResponse.json({ ok: true, method: "GET" });
    res.headers.set("X-RateLimit-Limit", String(info.limit));
    res.headers.set("X-RateLimit-Remaining", String(info.remaining));
    res.headers.set("X-RateLimit-Reset", String(info.reset));
    return res;
  } catch (e) {
    return e as NextResponse;
  }
}
