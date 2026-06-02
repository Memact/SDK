# Memact SDK

The SDK helps apps connect to Memact without writing raw HTTP calls.

Use it from your server. Do not put a Memact API key in browser code.

## Current Direction

Memact is a user-controlled context layer for app personalization.

Apps send context. App categories give it shape. Wiki gives users control.

Apps can use the SDK to request access, propose Wiki entries, send app signals or context, read allowed category context, and work with category rules.

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

Use the same environment variables shown in the Memact Connect tutorial:

```env
MEMACT_BASE_URL=https://api.memact.com
MEMACT_API_KEY=mka_key_shown_once
MEMACT_APP_ID=app_id_from_memact_portal
MEMACT_CONNECTION_ID=connection_id_from_connect_redirect
```

## Methods

Current and planned SDK methods should support:

- `verifyAccess(options)` checks scopes, categories, and connection access.
- `proposeWikiEntry(entry)` proposes a user-visible Wiki entry.
- `submitContext(context)` sends app context for category shaping.
- `getAllowedContext(options)` retrieves allowed category context.
- `listContext(options)` retrieves permitted category context rules.
- `addContextCategory(context)` registers a context category through Access.
- `addSubContext(contextId, subContext)` registers a subcategory definition.
- `getContext(contextId)` retrieves one context category.
- `getSchemas`, `addSchema`, `addSubSchema`, and `getSchema` remain as compatibility aliases for older integrations.
- `getMemory(options)` retrieves permitted memory summaries.

Compatibility methods may still exist while the product moves away from Capture and Playground as current core.

## Discord Channel Personalizer

Discord bots can run `discord-channel-personalizer` after the Discord user connects Memact and consents. The bot should send server channel names/topics and approved memory, not private messages by default.

```js
const result = await memact.runFeature("discord-channel-personalizer", {
  activity_categories: ["community:discord"],
  user_memory: {
    interests: ["developer tools", "memact"],
    muted_topics: ["memes"]
  },
  server: {
    name: "Memact",
    channels: [
      { id: "1", name: "memact-api", topic: "SDK and API help" },
      { id: "2", name: "memes", topic: "off-topic jokes" }
    ]
  }
});
```

## Consent and Wiki Links

Apps should embed both user surfaces:

- Connect opens before access so the user can choose what the app may use.
- Wiki opens after access so the user can review proposed context, accepted context, visibility, and future access.

Keep both links in your app UI. Do not hide the Wiki behind settings only.
