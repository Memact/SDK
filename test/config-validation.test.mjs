import test from "node:test"
import assert from "node:assert/strict"
import { validateClientConfig } from "../src/config-validation.mjs"

test("valid config returns ok true", () => {
  const result = validateClientConfig({
    baseUrl: "https://api.example.test",
    apiKey: "key_123",
    appId: "app_1",
    connectionId: "conn_1"
  })
  assert.equal(result.ok, true)
  assert.deepEqual(result.errors, [])
})

test("missing baseUrl returns error", () => {
  const result = validateClientConfig({})
  assert.equal(result.ok, false)
  assert.ok(result.errors.includes("baseUrl is required and must be a string"))
})

test("non-string apiKey returns error", () => {
  const result = validateClientConfig({ baseUrl: "https://api.example.test", apiKey: 12345 })
  assert.equal(result.ok, false)
  assert.ok(result.errors.includes("apiKey must be a string when provided"))
})

test("multiple invalid fields collect multiple errors", () => {
  const result = validateClientConfig({
    baseUrl: "https://api.example.test",
    apiKey: 1,
    appId: true,
    connectionId: []
  })
  assert.equal(result.ok, false)
  assert.equal(result.errors.length, 3)
})