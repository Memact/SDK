# Memact SDK

The Memact SDK makes it easy for developers to connect their apps to user addresses and communicate using the CAP and CCP protocols.

## What the SDK Does

The SDK is a client library for JavaScript and Node.js. It lets your app:

1. **Connect** to any identity address, automatically finding the provider.
2. **Request context** from the user's provider using CAP.
3. **Contribute observations** to the user's pending queue using CCP.

## Provider Independence

The SDK is not locked into any single provider. It resolves the provider from the user's address, fetches its configurations, and routes subsequent requests directly to it. This means an app using the SDK works with any provider implementing the CAP and CCP standards.

## Quick Start

```js
import { MemactClient } from '@memact/sdk';

// Connect to any identity address
const client = await MemactClient.connect('alice@memact.com', {
  appId: 'your-app-id',
  appSecret: 'your-app-secret'
});

// Request context (CAP)
const context = await client.requestContext({
  categories: ['fitness.v1'],
  fields: ['preferred_activity', 'experience_level'],
  purpose: 'personalize workout recommendations'
});

// Contribute an observation (CCP)
await client.contribute({
  category: 'fitness.v1',
  field: 'completed_workout',
  value: { type: 'run', distance_km: 5.2 },
  entry_type: 'app_observation',
  evidence: {
    source: 'gps_tracker',
    confidence: 0.95,
    description: 'GPS-tracked run'
  }
});
```

## Install

```bash
npm install @memact/sdk
```

## License

Apache 2.0. The SDK is open and free.
