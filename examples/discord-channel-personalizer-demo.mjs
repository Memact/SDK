import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({
  baseUrl: process.env.MEMACT_BASE_URL || "https://api.memact.com",
  apiKey: process.env.MEMACT_API_KEY,
  appId: process.env.MEMACT_APP_ID || "discord-bot",
  connectionId: process.env.MEMACT_CONNECTION_ID
})

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
})

console.log(result)
