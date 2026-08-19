import { randomUUID } from 'node:crypto'

import Wreck from '@hapi/wreck'

import { FeatureFlagParameterError, FeatureFlagQueryError } from './errors.js'
import { addCaching } from './internal/add-caching.js'
import {
  getValidatedApiKey,
  getValidatedBaseUrl,
  getValidatedCacheTimeoutSeconds,
  getValidatedEnvironmentName,
  getValidatedProductName
} from './internal/validate-options.js'
import {
  getValidatedFlagName,
  getValidatedGroupName
} from './internal/validate-parameters.js'
import {
  mapFlagStatusResponse,
  mapGroupStatusResponse
} from './internal/map-response.js'

/**
 * @typedef {object} FeatureFlagStatus
 * @property {string} flagName
 * @property {boolean} flagEnabled
 * @property {boolean} success
 */

/**
 * @typedef {object} FeatureFlagGroupStatus
 * @property {string} groupName
 * @property {boolean} groupEnabled
 * @property {FeatureFlagStatus[]} features
 * @property {boolean} success
 */

const HTTP_STATUS_OK_MIN = 200
const HTTP_STATUS_OK_MAX = 299

export class FeatureFlagClient {
  #apiKey
  #baseUrl
  #productName
  #environmentName
  #correlationIdFactory
  #getGroupStatus
  #getFlagStatus

  /**
   * @param {object} options
   * @param {string} options.apiKey - API key for authentication.
   * @param {string} options.baseUrl - Base URL of the feature flag API.
   * @param {string} options.productName - Name of the consuming product.
   * @param {string} options.environmentName - Environment (e.g. dev, test, prod).
   * @param {number} [options.cacheTimeoutSeconds] - How long to cache flag values, minimum 30. Defaults to 1800.
   * @param {() => string} [options.correlationIdFactory] - Generates a correlation id per request. Defaults to a random UUID.
   */
  constructor({
    apiKey,
    baseUrl,
    productName,
    environmentName,
    cacheTimeoutSeconds,
    correlationIdFactory = randomUUID
  }) {
    this.#apiKey = getValidatedApiKey(apiKey)
    this.#baseUrl = getValidatedBaseUrl(baseUrl)
    this.#productName = getValidatedProductName(productName)
    this.#environmentName = getValidatedEnvironmentName(environmentName)
    this.#correlationIdFactory = correlationIdFactory

    const validCacheTimeoutSeconds =
      getValidatedCacheTimeoutSeconds(cacheTimeoutSeconds)
    this.#getGroupStatus = addCaching(
      this.#fetchGroupStatus.bind(this),
      validCacheTimeoutSeconds
    )
    this.#getFlagStatus = addCaching(
      this.#fetchFlagStatus.bind(this),
      validCacheTimeoutSeconds
    )
  }

  /**
   * Gets the status of all feature flags in a group.
   *
   * @param {string} groupName
   * @returns {Promise<FeatureFlagGroupStatus>}
   */
  async getFeatureFlagGroupStatus(groupName) {
    groupName = getValidatedGroupName(groupName)

    return this.#getGroupStatus(groupName)
  }

  /**
   * Gets the status of a specific feature flag.
   *
   * @param {string} groupName
   * @param {string} flagName
   * @returns {Promise<FeatureFlagStatus>}
   */
  async getFeatureFlagStatus(groupName, flagName) {
    groupName = getValidatedGroupName(groupName)
    flagName = getValidatedFlagName(flagName)

    return this.#getFlagStatus(groupName, flagName)
  }

  #getHeaders() {
    const correlationId = this.#correlationIdFactory()

    if (!correlationId) {
      throw new FeatureFlagParameterError(
        'FeatureFlag correlationId cannot be empty'
      )
    }

    return {
      'x-api-key': this.#apiKey,
      'x-cdp-request-id': correlationId,
      'product-name': this.#productName,
      'environment-name': this.#environmentName
    }
  }

  async #fetchGroupStatus(groupName) {
    const result = await this.#get(
      `evaluate/${encodeURIComponent(groupName)}`,
      `Failed to get feature flag group status for group '${groupName}'`
    )
    return mapGroupStatusResponse(result)
  }

  async #fetchFlagStatus(groupName, flagName) {
    const result = await this.#get(
      `evaluate/${encodeURIComponent(groupName)}/${encodeURIComponent(flagName)}`,
      `Failed to get feature flag status for flag '${flagName}' within group '${groupName}'`
    )
    return mapFlagStatusResponse(result)
  }

  async #get(relativeUrl, errorPrefix) {
    let result

    try {
      result = await Wreck.get(relativeUrl, {
        baseUrl: this.#baseUrl,
        json: true,
        headers: this.#getHeaders()
      })
    } catch (err) {
      throw this.#wrapError(err, errorPrefix)
    }

    if (
      result.res.statusCode < HTTP_STATUS_OK_MIN ||
      result.res.statusCode > HTTP_STATUS_OK_MAX
    ) {
      throw new FeatureFlagQueryError(
        `${errorPrefix}: 'Request failed with status ${result.res.statusCode}'`
      )
    }

    return result.payload
  }

  #wrapError(err, errorPrefix) {
    if (
      err instanceof FeatureFlagParameterError ||
      err instanceof FeatureFlagQueryError
    ) {
      return err
    }
    return new FeatureFlagQueryError(`${errorPrefix}: '${err.message}'`)
  }
}
