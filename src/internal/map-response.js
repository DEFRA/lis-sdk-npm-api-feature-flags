/** @import { FeatureFlagGroupStatus, FeatureFlagStatus } from '../feature-flag-client.js' */

/**
 * @param {{group_name: string, group_enabled: boolean, success: boolean, features?: {flag_name: string, flag_enabled: boolean}[]}} response
 * @returns {FeatureFlagGroupStatus}
 */
export function mapGroupStatusResponse(response) {
  return {
    groupName: response.group_name,
    groupEnabled: response.group_enabled,
    success: response.success,
    features: (response.features ?? []).map((feature) => ({
      flagName: feature.flag_name,
      flagEnabled: feature.flag_enabled,
      success: true
    }))
  }
}

/**
 * @param {{flag_name: string, flag_enabled: boolean, success: boolean}} response
 * @returns {FeatureFlagStatus}
 */
export function mapFlagStatusResponse(response) {
  return {
    flagName: response.flag_name,
    flagEnabled: response.flag_enabled,
    success: response.success
  }
}
