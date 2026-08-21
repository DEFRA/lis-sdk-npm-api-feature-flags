# Defra Livestock API SDK (npm)

JavaScript/Node client for the feature flag REST API, retrieving feature flags for a given product and environment. This is the npm counterpart to the [NuGet Feature Flags SDK](../../nuget/api-feature-flags).

## Installation & Usage

```js
import { FeatureFlagClient } from '@defra/lis-sdk-npm-api-feature-flags'

const featureFlagClient = new FeatureFlagClient({
  baseUrl: 'https://feature-flag-url.com',
  apiKey: 'your-api-key',
  productName: 'YourProductName',
  environmentName: 'dev',
  cacheTimeoutSeconds: 1800, // Optional: default is 1800, must be 30 or greater
  correlationIdFactory: () => crypto.randomUUID() // Optional: called once per request. Defaults to a random UUID.
})

// Check a single feature flag
const flag = await featureFlagClient.getFeatureFlagStatus('MyGroup', 'MyFlag')

if (flag.flagEnabled) {
  // Execute new feature logic
}

// Check a whole group of flags
const group = await featureFlagClient.getFeatureFlagGroupStatus('MyGroup')

if (group.groupEnabled) {
  for (const feature of group.features) {
    console.log(`Flag: ${feature.flagName}, Enabled: ${feature.flagEnabled}`)
  }
}
```

### Constructor Options

| Property               | Type           | Description                                           | Required                  |
| :--------------------- | :------------- | :---------------------------------------------------- | :------------------------ |
| `baseUrl`              | `string`       | The base URL of the Feature Flag API.                 | Yes                       |
| `apiKey`               | `string`       | The API key for authentication.                       | Yes                       |
| `productName`          | `string`       | The name of your product.                             | Yes                       |
| `environmentName`      | `string`       | The environment (e.g. dev, test, ext-test, prod).     | Yes                       |
| `cacheTimeoutSeconds`  | `number`       | How long to cache flag values (min 30s).              | No (default: 1800)        |
| `correlationIdFactory` | `() => string` | Called once per request to generate a correlation id. | No (default: random UUID) |

### Response Shapes

#### FeatureFlagStatus

Returned when querying an individual flag, or as an entry in a group's `features` list.

- `flagName` (string): The name of the flag.
- `flagEnabled` (boolean): Whether the flag is enabled.
- `success` (boolean): Whether the flag could be retrieved successfully.

#### FeatureFlagGroupStatus

Returned when querying a flag group.

- `groupName` (string): The name of the group.
- `groupEnabled` (boolean): Whether the group itself is enabled.
- `features` (FeatureFlagStatus[]): The individual feature flag statuses within the group.
- `success` (boolean): Whether the group could be retrieved successfully.

### Error Handling

The SDK may throw the following errors, both exported from the package:

- `FeatureFlagParameterError`: Thrown when constructor options or method arguments are invalid, or if `correlationIdFactory` returns an empty value.
- `FeatureFlagQueryError`: Thrown when there is an error communicating with the Feature Flag API, or it returns a non-2xx response.

Consumers are expected to handle logging themselves should an error be thrown, in order to avoid double logging.
