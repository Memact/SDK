# Memact SDK

The SDK helps apps send signals and use Memact features without writing raw HTTP calls.

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
