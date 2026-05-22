import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({
  baseUrl: process.env.MEMACT_BASE_URL || "http://localhost:8787",
  apiKey: process.env.MEMACT_API_KEY,
  appId: "article-app-demo",
  connectionId: process.env.MEMACT_CONNECTION_ID || "demo-connection"
})

await memact.capture({
  event_type: "article_open",
  category: "reading",
  payload: {
    title: "New rules for AI policy",
    topic: "ai policy",
    source: "Example News",
    url: "https://example.com/ai-policy"
  }
})

await memact.capture({
  event_type: "scroll_depth_update",
  category: "reading",
  payload: {
    title: "New rules for AI policy",
    topic: "ai policy",
    scroll_depth: 88
  }
})

const result = await memact.runFeature("adaptive-article-overview", {
  article: {
    title: "New rules for AI policy",
    excerpt: "A regulator published new rules for AI systems used in public services.",
    topic: "ai policy",
    source: "Example News",
    estimated_read_time_minutes: 8
  },
  reading_memory: {
    average_read_time_seconds: 260,
    average_scroll_depth: 88,
    finish_rate: 0.82,
    preferred_topics: ["ai policy", "technology regulation"],
    skipped_topics: ["celebrity"],
    preferred_article_length: "long",
    preferred_summary_style: "deep_dive",
    repeat_topics: ["ai policy"]
  },
  recent_events: []
})

console.log(result)
