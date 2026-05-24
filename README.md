# Memact SDK

The SDK helps apps connect to Memact without writing raw HTTP calls.

Use it from your server. Do not put a Memact API key in browser code.

## Current Direction

Memact is a user-controlled context layer for app personalization.

Apps send context. App categories give it shape. Wiki gives users control.

Apps can use the SDK to request access, propose Wiki entries, send app context, read allowed category context, and work with category schemas.

## Example

```js
import { createMemactClient } from "@memact/sdk";

const memact = createMemactClient({
  baseUrl: "https://api.memact.com",
  apiKey: process.env.MEMACT_API_KEY,
  appId: "your_app_id",
  connectionId: "connection_id_from_consent"
});
```

Keep API keys on the server. Do not put them in browser code, public repos, logs, or user-facing settings.

## Methods

Current and planned SDK methods should support:

- `verifyAccess(options)` checks scopes, categories, and connection access.
- `proposeWikiEntry(entry)` proposes a user-visible Wiki entry.
- `submitContext(context)` sends app context for category shaping.
- `getAllowedContext(options)` retrieves allowed category context.
- `getSchemas(options)` retrieves permitted category schemas.
- `addSchema(schema)` registers a schema definition through Access.
- `addSubSchema(schemaId, subSchema)` registers a subschema definition.
- `getSchema(schemaId)` retrieves one schema definition.
- `getMemory(options)` retrieves permitted memory summaries.

Compatibility methods may still exist while the product moves away from Capture and Playground as current core.

## Consent and Wiki Links

Apps should embed both user surfaces:

- Connect opens before access so the user can choose what the app may use.
- Wiki opens after access so the user can review proposed context, accepted context, visibility, and future access.

Keep both links in your app UI. Do not hide the Wiki behind settings only.
