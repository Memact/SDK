# Memact SDK

The SDK helps apps send signals and use Memact features without writing raw HTTP calls.

Use it from your server. Do not put a Memact API key in browser code.

## Example

```js
import { createMemactClient } from "@memact/sdk";

const memact = createMemactClient({
  baseUrl: "https://api.memact.com",
  apiKey: process.env.MEMACT_API_KEY,
  appId: "your_app_id",
  connectionId: "connection_id_from_consent"
});

await memact.capture({
  event_type: "article_read",
  category: "web:research",
  payload: { title, url }
});

const result = await memact.runFeature("user-context-wiki", {
  schema_packets: []
});
```

Keep API keys on the server. Do not put them in browser code.

## Methods

- `capture(event)` sends a capture event to `/v1/capture/events`.
- `verifyAccess(options)` checks scopes, categories, and connection access.
- `getFeatures()` lists available Memact features.
- `runFeature(featureId, input, options)` asks Access to run a feature.
- `getSchemas(options)` retrieves permitted schema summaries.
- `getMemory(options)` retrieves permitted memory summaries.

The SDK fills basic defaults like `schema_version`, `source_app`, and
`occurred_at` for capture events.
