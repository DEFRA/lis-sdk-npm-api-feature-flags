import { afterEach, describe, expect, test, vi } from 'vitest'

import { addCaching } from './add-caching.js'

describe('addCaching()', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('it calls the wrapped function and returns its result on a cache miss', async () => {
    // Arrange
    const fn = vi.fn().mockResolvedValue('value')
    const cachedFn = addCaching(fn, 30)

    // Act
    const result = await cachedFn('a')

    // Assert
    expect(result).toBe('value')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('a')
  })

  test('it returns the cached value without calling the function again for the same arguments', async () => {
    // Arrange
    const fn = vi.fn().mockResolvedValue('value')
    const cachedFn = addCaching(fn, 30)
    await cachedFn('a')

    // Act
    const result = await cachedFn('a')

    // Assert
    expect(result).toBe('value')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('it calls the function again once the ttl has expired', async () => {
    // Arrange
    vi.useFakeTimers()
    const fn = vi.fn().mockResolvedValue('value')
    const cachedFn = addCaching(fn, 30)
    await cachedFn('a')

    // Act
    vi.advanceTimersByTime(30_001)
    await cachedFn('a')

    // Assert
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('it does not cache when the function throws', async () => {
    // Arrange
    const failingFn = vi.fn().mockRejectedValue(new Error('boom'))
    const cachedFn = addCaching(failingFn, 30)
    let error

    // Act
    try {
      await cachedFn('a')
    } catch (e) {
      error = e
    }
    failingFn.mockResolvedValue('value')
    const result = await cachedFn('a')

    // Assert
    expect(error?.message).toBe('boom')
    expect(result).toBe('value')
    expect(failingFn).toHaveBeenCalledTimes(2)
  })

  test('it deduplicates concurrent calls for the same arguments, calling the function only once', async () => {
    // Arrange
    let resolveFn
    const fn = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        })
    )
    const cachedFn = addCaching(fn, 30)

    // Act
    const promiseA = cachedFn('a')
    const promiseB = cachedFn('a')
    resolveFn('value')
    const [resultA, resultB] = await Promise.all([promiseA, promiseB])

    // Assert
    expect(resultA).toBe('value')
    expect(resultB).toBe('value')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('it caches different arguments independently', async () => {
    // Arrange
    const fn = vi.fn((value) => Promise.resolve(value))
    const cachedFn = addCaching(fn, 30)

    // Act
    const resultA = await cachedFn('a')
    const resultB = await cachedFn('b')

    // Assert
    expect(resultA).toBe('a')
    expect(resultB).toBe('b')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
