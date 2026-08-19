import { describe, expect, test } from 'vitest'

import {
  getValidatedFlagName,
  getValidatedGroupName
} from './validate-parameters.js'

describe('validate-parameters', () => {
  test('getValidatedGroupName returns the group name when it is valid', () => {
    // Arrange
    const groupName = 'my-group'

    // Act
    const result = getValidatedGroupName(groupName)

    // Assert
    expect(result).toBe(groupName)
  })

  test('getValidatedGroupName throws when the group name is blank', () => {
    // Arrange
    const groupName = '   '

    // Act
    let error
    try {
      getValidatedGroupName(groupName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag groupName is required')
  })

  test('getValidatedGroupName throws when the group name exceeds 100 characters', () => {
    // Arrange
    const groupName = 'a'.repeat(101)

    // Act
    let error
    try {
      getValidatedGroupName(groupName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe(
      'FeatureFlag groupName cannot exceed 100 characters'
    )
  })

  test('getValidatedFlagName returns the flag name when it is valid', () => {
    // Arrange
    const flagName = 'my-flag'

    // Act
    const result = getValidatedFlagName(flagName)

    // Assert
    expect(result).toBe(flagName)
  })

  test('getValidatedFlagName throws when the flag name is blank', () => {
    // Arrange
    const flagName = ''

    // Act
    let error
    try {
      getValidatedFlagName(flagName)
    } catch (e) {
      error = e
    }

    // Assert
    expect(error?.message).toBe('FeatureFlag flagName is required')
  })
})
