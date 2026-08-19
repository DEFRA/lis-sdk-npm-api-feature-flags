import { FeatureFlagParameterError } from '../errors.js'

const MAX_GROUP_NAME_LENGTH = 100

/**
 * @param {string} groupName
 * @returns {string} groupName, if valid.
 */
export function getValidatedGroupName(groupName) {
  if (!groupName?.trim()) {
    throw new FeatureFlagParameterError('FeatureFlag groupName is required')
  }

  if (groupName.length > MAX_GROUP_NAME_LENGTH) {
    throw new FeatureFlagParameterError(
      `FeatureFlag groupName cannot exceed ${MAX_GROUP_NAME_LENGTH} characters`
    )
  }

  return groupName
}

/**
 * @param {string} flagName
 * @returns {string} flagName, if valid.
 */
export function getValidatedFlagName(flagName) {
  if (!flagName?.trim()) {
    throw new FeatureFlagParameterError('FeatureFlag flagName is required')
  }

  return flagName
}
