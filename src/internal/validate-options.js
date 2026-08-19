import { FeatureFlagParameterError } from '../errors.js'

const DEFAULT_CACHE_TIMEOUT_SECONDS = 1800
const MIN_CACHE_TIMEOUT_SECONDS = 30
const MAX_CACHE_TIMEOUT_SECONDS = 86400
const MAX_API_KEY_LENGTH = 100
const MAX_BASE_URL_LENGTH = 2000
const MAX_ENVIRONMENT_NAME_LENGTH = 10
const MAX_PRODUCT_NAME_LENGTH = 50

function isAbsoluteUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} apiKey
 * @returns {string} apiKey, if valid.
 */
export function getValidatedApiKey(apiKey) {
  if (!apiKey?.trim()) {
    throw new FeatureFlagParameterError('FeatureFlag apiKey is required')
  }

  if (apiKey.length > MAX_API_KEY_LENGTH) {
    throw new FeatureFlagParameterError(
      `FeatureFlag apiKey cannot exceed ${MAX_API_KEY_LENGTH} characters`
    )
  }

  return apiKey
}

/**
 * @param {string} baseUrl
 * @returns {string} baseUrl, if valid.
 */
export function getValidatedBaseUrl(baseUrl) {
  if (!baseUrl?.trim()) {
    throw new FeatureFlagParameterError('FeatureFlag baseUrl is required')
  }

  if (baseUrl.length > MAX_BASE_URL_LENGTH) {
    throw new FeatureFlagParameterError(
      `FeatureFlag baseUrl cannot exceed ${MAX_BASE_URL_LENGTH} characters`
    )
  }

  if (!isAbsoluteUrl(baseUrl)) {
    throw new FeatureFlagParameterError(
      'FeatureFlag baseUrl is not a valid URL'
    )
  }

  return baseUrl
}

/**
 * @param {string} environmentName
 * @returns {string} environmentName, if valid.
 */
export function getValidatedEnvironmentName(environmentName) {
  if (!environmentName?.trim()) {
    throw new FeatureFlagParameterError(
      'FeatureFlag environmentName is required'
    )
  }

  if (environmentName.length > MAX_ENVIRONMENT_NAME_LENGTH) {
    throw new FeatureFlagParameterError(
      `FeatureFlag environmentName cannot exceed ${MAX_ENVIRONMENT_NAME_LENGTH} characters`
    )
  }

  return environmentName
}

/**
 * @param {string} productName
 * @returns {string} productName, if valid.
 */
export function getValidatedProductName(productName) {
  if (!productName?.trim()) {
    throw new FeatureFlagParameterError('FeatureFlag productName is required')
  }

  if (productName.length > MAX_PRODUCT_NAME_LENGTH) {
    throw new FeatureFlagParameterError(
      `FeatureFlag productName cannot exceed ${MAX_PRODUCT_NAME_LENGTH} characters`
    )
  }

  return productName
}

/**
 * @param {number} [cacheTimeoutSeconds] - Defaults to 1800.
 * @returns {number} cacheTimeoutSeconds, if valid.
 */
export function getValidatedCacheTimeoutSeconds(
  cacheTimeoutSeconds = DEFAULT_CACHE_TIMEOUT_SECONDS
) {
  if (cacheTimeoutSeconds < MIN_CACHE_TIMEOUT_SECONDS) {
    throw new FeatureFlagParameterError(
      `FeatureFlag cacheTimeoutSeconds must be ${MIN_CACHE_TIMEOUT_SECONDS} or greater`
    )
  }

  if (cacheTimeoutSeconds > MAX_CACHE_TIMEOUT_SECONDS) {
    throw new FeatureFlagParameterError(
      `FeatureFlag cacheTimeoutSeconds cannot exceed ${MAX_CACHE_TIMEOUT_SECONDS}`
    )
  }

  return cacheTimeoutSeconds
}
