import test from "node:test"
import assert from "node:assert/strict"
import { createMemactClient, MemactSDKError } from "../src/index.mjs"

test("missing baseUrl throws", () => {
  assert.throws(() => createMemactClient(), MemactSDKError)
})

test("capture posts to correct endpoint and fills defaults", async () => {
  const calls = []
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    apiKey: "mka_test",
    appId: "app_1",
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return new Response(JSON.stringify({ accepted: true }), { status: 200 })
    }
  })
  await client.capture({ event_type: "article_read", category: "web:research", payload: {} })
  const body = JSON.parse(calls[0].options.body)
  assert.equal(calls[0].url, "https://api.example.test/v1/capture/events")
  assert.equal(body.source_app, "app_1")
  assert.ok(body.occurred_at)
})

test("verifyAccess and runFeature post correctly", async () => {
  const urls = []
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async (url) => {
      urls.push(url)
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
  })
  await client.verifyAccess({})
  await client.runFeature("adaptive-article-overview", {})
  assert.deepEqual(urls, [
    "https://api.example.test/v1/access/verify",
    "https://api.example.test/v1/features/adaptive-article-overview/run"
  ])
})

test("schema helper methods call schema endpoints", async () => {
  const calls = []
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
  })
  await client.addSchema({ schema_id: "reading_preferences", category: "reading" })
  await client.addSubSchema("reading_preferences", { sub_schema_id: "summary_style_preference" })
  await client.getSchema("reading_preferences")
  assert.equal(calls[0].url, "https://api.example.test/v1/schemas")
  assert.equal(calls[0].options.method, "POST")
  assert.equal(calls[1].url, "https://api.example.test/v1/schemas/reading_preferences/subschemas")
  assert.equal(calls[2].url, "https://api.example.test/v1/schemas/reading_preferences")
})

test("context helper methods call context endpoints", async () => {
  const calls = []
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
  })
  await client.addContextCategory({ context_id: "reading_preferences", category: "reading" })
  await client.addSubContext("reading_preferences", { sub_context_id: "summary_style_preference" })
  await client.getContext("reading_preferences")
  assert.equal(calls[0].url, "https://api.example.test/v1/context")
  assert.equal(calls[0].options.method, "POST")
  assert.equal(calls[1].url, "https://api.example.test/v1/context/reading_preferences/subcontexts")
  assert.equal(calls[2].url, "https://api.example.test/v1/context/reading_preferences")
})

test("signal, context proposal, and credit methods call access endpoints", async () => {
  const calls = []
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    apiKey: "mka_test",
    appId: "music-app",
    connectionId: "con_1",
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
  })

  await client.sendSignal({ event_type: "playlist_replay", category: "music", payload: { genre: "Brazilian phonk" } })
  await client.proposeContext({ category: "music", title: "Prefers Brazilian phonk", context: { genre: "Brazilian phonk" } })
  await client.suggestMemory({ category: "fitness", title: "Prefers strength workouts", context: { preference: "strength" } })
  await client.getAllowedMemory({ connection_id: "conn_1", activity_categories: ["fitness"] })
  await client.getCredits()

  assert.equal(calls[0].url, "https://api.example.test/v1/wiki/proposals")
  assert.equal(JSON.parse(calls[0].options.body).raw_signal.source_app, "music-app")
  assert.equal(calls[1].url, "https://api.example.test/v1/wiki/proposals")
  assert.equal(JSON.parse(calls[1].options.body).proposal.title, "Prefers Brazilian phonk")
  assert.equal(calls[2].url, "https://api.example.test/v1/memory/suggestions")
  assert.equal(JSON.parse(calls[2].options.body).proposal.title, "Prefers strength workouts")
  assert.equal(calls[3].url, "https://api.example.test/v1/memory?connection_id=conn_1&activity_categories=fitness")
  assert.equal(calls[4].url, "https://api.example.test/v1/credits")
})

test("CAP helpers call CAP endpoints from server-side client", async () => {
  const calls = []
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    apiKey: "mka_test",
    appId: "fitness-app",
    connectionId: "con_1",
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
  })

  await client.cap.request({
    purpose: "onboarding_prefill",
    requested_context: [{ description: "workout goal", required: true }],
    requested_categories: ["fitness"]
  })
  await client.cap.packet({
    request_id: "cap_req_1",
    requested_categories: ["fitness"]
  })
  await client.cap.propose({
    category: "fitness",
    field_path: "fitness.goal",
    proposed_value: "maintenance"
  })

  assert.equal(calls[0].url, "https://api.example.test/v1/cap/requests")
  assert.equal(JSON.parse(calls[0].options.body).connection_id, "con_1")
  assert.equal(calls[1].url, "https://api.example.test/v1/cap/packets")
  assert.equal(calls[2].url, "https://api.example.test/v1/cap/proposals")
})

test("non-2xx response throws MemactSDKError", async () => {
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async () => new Response(JSON.stringify({ error: { code: "nope", message: "Nope" } }), { status: 403 })
  })
  await assert.rejects(() => client.getFeatures(), /Nope/)
})
