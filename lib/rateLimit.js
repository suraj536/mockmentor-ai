const store = (globalThis.__rateLimitStore ??= new Map());

if (!globalThis.__rateLimitCleanupInitialized) {
  globalThis.__rateLimitCleanupInitialized = true;
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      const validTimestamps = record.timestamps.filter(
        (ts) => ts > now - record.windowMs
      );
      if (validTimestamps.length === 0) {
        store.delete(key);
      } else {
        record.timestamps = validTimestamps;
      }
    }
  }, 5 * 60 * 1000);

  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}

export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  let record = store.get(key);

  if (!record) {
    record = { timestamps: [], windowMs };
    store.set(key, record);
  }

  record.windowMs = windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > now - windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

