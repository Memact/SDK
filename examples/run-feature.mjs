import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({ baseUrl: "https://api.memact.com", apiKey: process.env.MEMACT_API_KEY })
await memact.runFeature("user-context-wiki", { schema_packets: [] })
