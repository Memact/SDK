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
  await client.runFeature("user-context-wiki", {})
  assert.deepEqual(urls, [
    "https://api.example.test/v1/access/verify",
    "https://api.example.test/v1/features/user-context-wiki/run"
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

test("non-2xx response throws MemactSDKError", async () => {
  const client = createMemactClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async () => new Response(JSON.stringify({ error: { code: "nope", message: "Nope" } }), { status: 403 })
  })
  await assert.rejects(() => client.getFeatures(), /Nope/)
})
