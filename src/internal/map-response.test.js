import { describe, expect, test } from 'vitest'

import {
  mapFlagStatusResponse,
  mapGroupStatusResponse
} from './map-response.js'

describe('map-response', () => {
  test('mapGroupStatusResponse maps snake_case fields and forces success on each feature', () => {
    // Arrange
    const response = {
      group_name: 'my-group',
      group_enabled: true,
      success: true,
      features: [
        { flag_name: 'flag-a', flag_enabled: true },
        { flag_name: 'flag-b', flag_enabled: false }
      ]
    }

    // Act
    const result = mapGroupStatusResponse(response)

    // Assert
    expect(result).toEqual({
      groupName: 'my-group',
      groupEnabled: true,
      success: true,
      features: [
        { flagName: 'flag-a', flagEnabled: true, success: true },
        { flagName: 'flag-b', flagEnabled: false, success: true }
      ]
    })
  })

  test('mapGroupStatusResponse defaults features to an empty array when absent', () => {
    // Arrange
    const response = {
      group_name: 'my-group',
      group_enabled: false,
      success: true
    }

    // Act
    const result = mapGroupStatusResponse(response)

    // Assert
    expect(result.features).toEqual([])
  })

  test('mapFlagStatusResponse maps snake_case fields', () => {
    // Arrange
    const response = { flag_name: 'my-flag', flag_enabled: true, success: true }

    // Act
    const result = mapFlagStatusResponse(response)

    // Assert
    expect(result).toEqual({
      flagName: 'my-flag',
      flagEnabled: true,
      success: true
    })
  })
})
