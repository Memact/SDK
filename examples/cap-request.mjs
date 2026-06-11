import { createMemactClient } from "../src/index.mjs"

const memact = createMemactClient({
  baseUrl: process.env.MEMACT_BASE_URL || "http://localhost:8787",
  apiKey: process.env.MEMACT_API_KEY,
  appId: process.env.MEMACT_APP_ID,
  connectionId: process.env.MEMACT_CONNECTION_ID
})

const request = await memact.cap.request({
  purpose: "onboarding_prefill",
  requested_categories: ["fitness"],
  requested_context: [
    { description: "workout goal", field_hint: "fitness.goal", required: true },
    { description: "dietary preference", field_hint: "diet.preference", required: false },
    { description: "allergy", field_hint: "diet.allergy", required: false }
  ]
})

const packet = await memact.cap.packet({
  request_id: request.request.request_id,
  requested_categories: ["fitness"]
})

console.log(JSON.stringify(packet.packet, null, 2))
