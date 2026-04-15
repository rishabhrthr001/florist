export const cache = new Map();

export const setCache = (key, data, ttlMs = 60000) => {
    cache.set(key, {
        data,
        expiry: Date.now() + ttlMs
    });
};

export const getCache = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
        cache.delete(key);
        return null;
    }
    return cached.data;
};

export const clearCache = (prefix = '') => {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
};
