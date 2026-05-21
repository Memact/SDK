import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({ baseUrl: "https://api.memact.com", apiKey: process.env.MEMACT_API_KEY })
await memact.verifyAccess({ required_scopes: ["memory:read_summary"], activity_categories: ["web:research"] })
