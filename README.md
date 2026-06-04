# Memact SDK

The SDK helps apps use Memact from server-side code.

Keep Memact API keys on the server. Do not put them in browser code, public
repos, logs, or user-facing settings.

## What Memact Does

Memact helps apps personalize with memory the user can see and control.

An app can ask first, suggest memory with evidence, and later read only the
memory the user allowed. If the app only has weak activity, Memact can keep it
as a reviewable suggestion instead of treating it as identity.

Activity is not identity.

## Setup

```js
import { createMemactClient } from "@memact/sdk";

const memact = createMemactClient({
  baseUrl: "https://api.memact.com",
  apiKey: process.env.MEMACT_API_KEY,
  appId: "your_app_id",
  connectionId: "connection_id_from_consent"
});
```

Use the same environment variables shown in the Memact Connect tutorial:

```env
MEMACT_BASE_URL=https://api.memact.com
MEMACT_API_KEY=mka_key_shown_once
MEMACT_APP_ID=app_id_from_memact_portal
MEMACT_CONNECTION_ID=connection_id_from_connect_redirect
```

## Main Methods

- `verifyAccess(options)` checks scopes, categories, and connection access.
- `suggestMemory(proposal)` suggests a memory entry for user review.
- `sendAppActivity(activity)` sends specific app activity for Memact to shape into a reviewable memory suggestion.
- `getMemory(options)` reads only allowed memory summaries.
- `getAllowedMemory(options)` is the clearer alias for app integrations.
- `getCredits()` returns the app credit ledger summary.

Context helpers:

- `listContext(options)` lists category rules.
- `addContextCategory(context)` registers a category through Access.
- `addSubContext(contextId, subContext)` registers a subcategory definition.
- `getContext(contextId)` retrieves one category.

Compatibility aliases remain for older integrations:

- `sendSignal(signal)` aliases `sendAppActivity`.
- `proposeContext(proposal)` and `proposeWikiEntry(entry)` still work.
- `capture(event)` still posts to the older capture route.
- `getSchemas`, `addSchema`, `addSubSchema`, and `getSchema` remain for older Schema wording.

## Example

```js
await memact.verifyAccess({
  required_scopes: ["context:write", "memory:read_summary"],
  activity_categories: ["fitness"],
  connection_id: process.env.MEMACT_CONNECTION_ID
});

await memact.suggestMemory({
  category: "fitness",
  title: "Prefers strength workouts",
  context: {
    preference: "strength workouts"
  },
  evidence: {
    reason: "The user completed strength workout plans in this app."
  }
});

const memory = await memact.getAllowedMemory({
  connection_id: process.env.MEMACT_CONNECTION_ID,
  activity_categories: ["fitness"]
});
```

## Credits

Credits are developer-side accounting.

- Specific app activity earns fewer credits because Memact still has to shape it
  before the user reviews it.
- A clear memory suggestion with evidence earns more.
- Reading allowed memory spends credits.

Users do not need to think about credits. Users see Yourself: what apps know,
what apps suggest, and what they can change.

## Consent and Yourself Links

Apps should embed both user surfaces:

- Connect opens before access so the user can choose what the app may use.
- Yourself opens after access so the user can review suggested memory, accepted
  memory, visibility, and future access.
