import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({ baseUrl: "https://api.memact.com", apiKey: process.env.MEMACT_API_KEY })
await memact.runFeature("adaptive-article-overview", {
  article: {
    title: "Example article",
    excerpt: "A short article excerpt",
    topic: "technology"
  },
  reading_memory: {
    preferred_summary_style: "key_points"
  },
  recent_events: []
})
