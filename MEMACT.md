# Memact — SDK

Memact is open identity infrastructure.

Users own an identity address. Apps interact with identity providers through open protocols.

## What the SDK Does

The SDK is the primary integration library for app developers. It enables any app to:

1. **Connect** to any identity address, resolving the provider automatically
2. **Request context** from the user's identity provider (CAP)
3. **Contribute observations** to the user's identity context (CCP)
4. **Propose corrections** to identity context (CRP)

## Provider Independence

The SDK is not tied to any single identity provider. Given an identity address, the SDK:
1. Performs WebFinger discovery to find the provider
2. Fetches the provider's capability document
3. Authenticates the app with the provider
4. Routes all subsequent calls to the correct protocol endpoints

This means an app built with the Memact SDK works with any CAP/CCP/CRP-compatible identity provider — not only Memact.

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
// context.entries[0].confidence → 0.87
// context.entries[0].decay_status → 'current'
// context.entries[0].entry_type → 'app_observation'

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

Apache 2.0. The SDK is intentionally provider-independent.
