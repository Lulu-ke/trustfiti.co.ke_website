import { LRUCache } from "lru-cache";

type CacheOptions = {
  max?: number;
  ttl?: number;
};

const defaultOptions: CacheOptions = {
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes default
};

function createCache(options: CacheOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  return new LRUCache<string, Record<string, unknown>>({
    max: opts.max ?? 500,
    ttl: opts.ttl ?? 300000,
    ttlAutopurge: true,
  });
}

// Rate limiting cache (tracks OTP attempts)
export const otpRateLimitCache = createCache({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

// General API response cache
export const apiCache = createCache({
  max: 200,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Company profile cache
export const companyCache = createCache({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

// Analytics cache
export const analyticsCache = createCache({
  max: 50,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export function getCache(key: string, cache: LRUCache<string, Record<string, unknown>>) {
  return cache.get(key);
}

export function setCache(key: string, value: Record<string, unknown>, cache: LRUCache<string, Record<string, unknown>>, ttl?: number) {
  if (ttl) {
    cache.set(key, value, { ttl });
  } else {
    cache.set(key, value);
  }
}

export function invalidateCache(key: string, cache: LRUCache<string, Record<string, unknown>>) {
  cache.delete(key);
}
