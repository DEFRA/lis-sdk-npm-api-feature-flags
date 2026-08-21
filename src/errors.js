/** Thrown when arguments passed to the client (or its options) are invalid. */
export class FeatureFlagParameterError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message)
    this.name = 'FeatureFlagParameterError'
  }
}

/** Thrown when the feature flag API request fails or returns an error response. */
export class FeatureFlagQueryError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message)
    this.name = 'FeatureFlagQueryError'
  }
}
