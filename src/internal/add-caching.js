const MS_PER_SECOND = 1000

/**
 * Wraps `fn`, caching each call's result for `ttlSeconds` keyed on its
 * arguments, so repeat calls with the same arguments within the ttl are
 * served from cache instead of calling `fn` again. Nothing is cached if
 * `fn` throws. The in-flight call is cached too (not just its resolved
 * value), so concurrent calls with the same arguments share a single call
 * to `fn` rather than each triggering one.
 *
 * @template {(...args: *[]) => Promise<*>} T
 * @param {T} fn
 * @param {number} ttlSeconds
 * @returns {T}
 */
export function addCaching(fn, ttlSeconds) {
  const store = new Map()

  return async (...args) => {
    const key = JSON.stringify(args)
    const cached = store.get(key)
    const now = Date.now()

    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    const entry = { expiresAt: now + ttlSeconds * MS_PER_SECOND }
    entry.value = fn(...args).catch((err) => {
      if (store.get(key) === entry) {
        store.delete(key)
      }
      throw err
    })

    store.set(key, entry)

    return entry.value
  }
}
