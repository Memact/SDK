import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({
  baseUrl: "https://api.memact.com",
  apiKey: process.env.MEMACT_API_KEY,
  appId: "example"
})

await memact.capture({
  event_type: "article_read",
  category: "web:research",
  payload: { title: "Example" }
})
