import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({
  baseUrl: process.env.MEMACT_BASE_URL || "http://localhost:8787",
  apiKey: process.env.MEMACT_API_KEY,
  appId: "article-app-demo",
  connectionId: process.env.MEMACT_CONNECTION_ID
})

await memact.addSchema({
  schema_id: "reading_preferences",
  category: "reading",
  description: "Reading behavior and article preference memory"
})

await memact.addSubSchema("reading_preferences", {
  sub_schema_id: "summary_style_preference",
  description: "Whether the user usually prefers quick briefs, key points, deep dives, or simple explainers"
})

await memact.addSubSchema("reading_preferences", {
  sub_schema_id: "article_length_preference",
  description: "Whether the user usually reads short, medium, or long articles"
})
