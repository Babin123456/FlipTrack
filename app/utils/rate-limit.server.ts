type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function rateLimit(
  request: Request,
  limit = 5,
  windowMs = 60_000
) {
  const ip = getClientIp(request);
  const now = Date.now();

  const existing = store.get(ip);

  if (!existing || existing.resetAt <= now) {
    store.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  existing.count++;

  if (existing.count > limit) {
    throw new Response(
      JSON.stringify({
        error: "Too many attempts. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  store.set(ip, existing);
}