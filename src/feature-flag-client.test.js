import { afterEach, describe, expect, test, vi } from 'vitest'

import Wreck from '@hapi/wreck'
import { FeatureFlagClient } from './feature-flag-client.js'
import { FeatureFlagParameterError, FeatureFlagQueryError } from './errors.js'

const mocks = {
  get: vi.spyOn(Wreck, 'get')
}

function validOptions(overrides = {}) {
  return {
    apiKey: 'api-key',
    baseUrl: 'https://feature-flags.example.com',
    productName: 'my-product',
    environmentName: 'dev',
    ...overrides
  }
}

describe('FeatureFlagClient', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('constructor throws a FeatureFlagParameterError for invalid options', () => {
    // Arrange
    const options = validOptions({ apiKey: '' })

    // Act
    let error
    try {
      // eslint-disable-next-line no-new
      new FeatureFlagClient(options)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeInstanceOf(FeatureFlagParameterError)
  })

  test('getFeatureFlagGroupStatus requests the group and forwards the required headers', async () => {
    // Arrange
    const correlationIdFactory = vi.fn().mockReturnValue('correlation-1')
    const client = new FeatureFlagClient(validOptions({ correlationIdFactory }))
    mocks.get.mockResolvedValueOnce({
      res: { statusCode: 200 },
      payload: {
        group_name: 'my-group',
        group_enabled: true,
        success: true,
        features: [{ flag_name: 'flag-a', flag_enabled: true }]
      }
    })

    // Act
    const result = await client.getFeatureFlagGroupStatus('my-group')

    // Assert
    expect(mocks.get).toHaveBeenCalledTimes(1)
    const [path, options] = mocks.get.mock.calls[0]
    expect(path).toBe('evaluate/my-group')
    expect(options.baseUrl).toBe('https://feature-flags.example.com')
    expect(options.headers).toEqual({
      'x-api-key': 'api-key',
      'x-cdp-request-id': 'correlation-1',
      'product-name': 'my-product',
      'environment-name': 'dev'
    })
    expect(result).toEqual({
      groupName: 'my-group',
      groupEnabled: true,
      success: true,
      features: [{ flagName: 'flag-a', flagEnabled: true, success: true }]
    })
  })

  test('getFeatureFlagGroupStatus does not request again while the cached value is fresh', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    mocks.get.mockResolvedValueOnce({
      res: { statusCode: 200 },
      payload: {
        group_name: 'my-group',
        group_enabled: true,
        success: true,
        features: []
      }
    })
    await client.getFeatureFlagGroupStatus('my-group')

    // Act
    await client.getFeatureFlagGroupStatus('my-group')

    // Assert
    expect(mocks.get).toHaveBeenCalledTimes(1)
  })

  test('getFeatureFlagGroupStatus throws a FeatureFlagParameterError for an invalid group name', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    let error

    // Act
    try {
      await client.getFeatureFlagGroupStatus('')
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeInstanceOf(FeatureFlagParameterError)
  })

  test('getFeatureFlagGroupStatus wraps a non-2xx response in a FeatureFlagQueryError', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    mocks.get.mockResolvedValueOnce({
      res: { statusCode: 500 },
      payload: null
    })
    let error

    // Act
    try {
      await client.getFeatureFlagGroupStatus('my-group')
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeInstanceOf(FeatureFlagQueryError)
    expect(error?.message).toContain(
      "Failed to get feature flag group status for group 'my-group'"
    )
  })

  test('getFeatureFlagGroupStatus wraps a Wreck failure in a FeatureFlagQueryError', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    mocks.get.mockRejectedValueOnce(new Error('network down'))
    let error

    // Act
    try {
      await client.getFeatureFlagGroupStatus('my-group')
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeInstanceOf(FeatureFlagQueryError)
    expect(error?.message).toContain('network down')
  })

  test('getFeatureFlagGroupStatus throws a FeatureFlagParameterError when the correlation id is empty', async () => {
    // Arrange
    const client = new FeatureFlagClient(
      validOptions({ correlationIdFactory: () => '' })
    )
    let error

    // Act
    try {
      await client.getFeatureFlagGroupStatus('my-group')
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeInstanceOf(FeatureFlagParameterError)
    expect(mocks.get).not.toHaveBeenCalled()
  })

  test('getFeatureFlagStatus requests the flag and maps the response', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    mocks.get.mockResolvedValueOnce({
      res: { statusCode: 200 },
      payload: { flag_name: 'my-flag', flag_enabled: true, success: true }
    })

    // Act
    const result = await client.getFeatureFlagStatus('my-group', 'my-flag')

    // Assert
    const [path] = mocks.get.mock.calls[0]
    expect(path).toBe('evaluate/my-group/my-flag')
    expect(result).toEqual({
      flagName: 'my-flag',
      flagEnabled: true,
      success: true
    })
  })

  test('getFeatureFlagStatus throws a FeatureFlagParameterError for an invalid flag name', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    let error

    // Act
    try {
      await client.getFeatureFlagStatus('my-group', '')
    } catch (e) {
      error = e
    }

    // Assert
    expect(error).toBeInstanceOf(FeatureFlagParameterError)
  })

  test('getFeatureFlagStatus caches per group/flag combination independently', async () => {
    // Arrange
    const client = new FeatureFlagClient(validOptions())
    mocks.get.mockResolvedValue({
      res: { statusCode: 200 },
      payload: { flag_name: 'my-flag', flag_enabled: true, success: true }
    })
    await client.getFeatureFlagStatus('my-group', 'flag-a')

    // Act
    await client.getFeatureFlagStatus('my-group', 'flag-b')

    // Assert
    expect(mocks.get).toHaveBeenCalledTimes(2)
  })
})
