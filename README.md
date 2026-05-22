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

const result = await memact.runFeature("adaptive-article-overview", {
  article: { title, excerpt, topic, source },
  reading_memory: { preferred_summary_style: "key_points" },
  recent_events: []
});
```

Keep API keys on the server. Do not put them in browser code.

## Methods

- `capture(event)` sends a capture event to `/v1/capture/events`.
- `verifyAccess(options)` checks scopes, categories, and connection access.
- `getFeatures()` lists available Memact features.
- `runFeature(featureId, input, options)` asks Access to run a feature.
- `getSchemas(options)` retrieves permitted schema summaries.
- `addSchema(schema)` registers a schema definition through Access.
- `addSubSchema(schemaId, subSchema)` registers a subschema definition.
- `getSchema(schemaId)` retrieves one schema definition.
- `getMemory(options)` retrieves permitted memory summaries.

The SDK fills basic defaults like `schema_version`, `source_app`, and
`occurred_at` for capture events.

## Adaptive Article Overview

Article apps can send approved reading events and run the `adaptive-article-overview` feature from their server.

```js
const result = await memact.runFeature("adaptive-article-overview", {
  article: { title, excerpt, topic, source, estimated_read_time_minutes },
  reading_memory: {
    average_read_time_seconds,
    average_scroll_depth,
    finish_rate,
    preferred_topics,
    skipped_topics,
    preferred_article_length,
    preferred_summary_style,
    repeat_topics
  },
  recent_events: []
});
```

The SDK only sends schema definitions and feature requests. Schema packet formation stays in the Schema repo.

## Consent and Wiki Links

Apps should embed both user surfaces:

- Connect opens before access so the user can choose what the app may use.
- Wiki opens after access so the user can review what the app can add, what Memact may create, and how to stop future access.

Keep both links in your app UI. Do not hide the Wiki behind settings only.
