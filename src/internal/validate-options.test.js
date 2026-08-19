import { describe, expect, test } from 'vitest'

import {
  getValidatedApiKey,
  getValidatedBaseUrl,
  getValidatedCacheTimeoutSeconds,
  getValidatedEnvironmentName,
  getValidatedProductName
} from './validate-options.js'

describe('getValidatedApiKey()', () => {
  test('it returns the apiKey when it is valid', () => {
    // Arrange
    const apiKey = 'api-key'

    // Act
    const result = getValidatedApiKey(apiKey)

    // Assert
    expect(result).toBe(apiKey)
  })

  test('it throws when apiKey is missing', () => {
    // Arrange
    const apiKey = ''

    // Act
    let error
    try {
      getValidatedApiKey(apiKey)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag apiKey is required')
  })

  test('it throws when apiKey exceeds 100 characters', () => {
    // Arrange
    const apiKey = 'a'.repeat(101)

    // Act
    let error
    try {
      getValidatedApiKey(apiKey)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag apiKey cannot exceed 100 characters'
    )
  })
})

describe('getValidatedBaseUrl()', () => {
  test('it returns the baseUrl when it is valid', () => {
    // Arrange
    const baseUrl = 'https://feature-flags.example.com'

    // Act
    const result = getValidatedBaseUrl(baseUrl)

    // Assert
    expect(result).toBe(baseUrl)
  })

  test('it throws when baseUrl is missing', () => {
    // Arrange
    const baseUrl = ''

    // Act
    let error
    try {
      getValidatedBaseUrl(baseUrl)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag baseUrl is required')
  })

  test('it throws when baseUrl is not a valid absolute URL', () => {
    // Arrange
    const baseUrl = 'not-a-url'

    // Act
    let error
    try {
      getValidatedBaseUrl(baseUrl)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag baseUrl is not a valid URL')
  })

  test('it throws when baseUrl exceeds 2000 characters', () => {
    // Arrange
    const baseUrl = `https://feature-flags.example.com/${'a'.repeat(2000)}`

    // Act
    let error
    try {
      getValidatedBaseUrl(baseUrl)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag baseUrl cannot exceed 2000 characters'
    )
  })
})

describe('getValidatedEnvironmentName()', () => {
  test('it returns the environmentName when it is valid', () => {
    // Arrange
    const environmentName = 'dev'

    // Act
    const result = getValidatedEnvironmentName(environmentName)

    // Assert
    expect(result).toBe(environmentName)
  })

  test('it throws when environmentName is missing', () => {
    // Arrange
    const environmentName = ''

    // Act
    let error
    try {
      getValidatedEnvironmentName(environmentName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag environmentName is required')
  })

  test('it throws when environmentName exceeds 10 characters', () => {
    // Arrange
    const environmentName = 'a'.repeat(11)

    // Act
    let error
    try {
      getValidatedEnvironmentName(environmentName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag environmentName cannot exceed 10 characters'
    )
  })
})

describe('getValidatedProductName()', () => {
  test('it returns the productName when it is valid', () => {
    // Arrange
    const productName = 'my-product'

    // Act
    const result = getValidatedProductName(productName)

    // Assert
    expect(result).toBe(productName)
  })

  test('it throws when productName is missing', () => {
    // Arrange
    const productName = ''

    // Act
    let error
    try {
      getValidatedProductName(productName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag productName is required')
  })

  test('it throws when productName exceeds 50 characters', () => {
    // Arrange
    const productName = 'a'.repeat(51)

    // Act
    let error
    try {
      getValidatedProductName(productName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag productName cannot exceed 50 characters'
    )
  })
})

describe('getValidatedCacheTimeoutSeconds()', () => {
  test('it returns cacheTimeoutSeconds when it is valid', () => {
    // Arrange
    const cacheTimeoutSeconds = 3600

    // Act
    const result = getValidatedCacheTimeoutSeconds(cacheTimeoutSeconds)

    // Assert
    expect(result).toBe(cacheTimeoutSeconds)
  })

  test('it defaults to 1800 when not provided', () => {
    // Act
    const result = getValidatedCacheTimeoutSeconds(undefined)

    // Assert
    expect(result).toBe(1800)
  })

  test('it throws when cacheTimeoutSeconds is below 30', () => {
    // Arrange
    const cacheTimeoutSeconds = 29

    // Act
    let error
    try {
      getValidatedCacheTimeoutSeconds(cacheTimeoutSeconds)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag cacheTimeoutSeconds must be 30 or greater'
    )
  })

  test('it throws when cacheTimeoutSeconds exceeds 86400', () => {
    // Arrange
    const cacheTimeoutSeconds = 86401

    // Act
    let error
    try {
      getValidatedCacheTimeoutSeconds(cacheTimeoutSeconds)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag cacheTimeoutSeconds cannot exceed 86400'
    )
  })
})
