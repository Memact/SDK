import { MemactSDKError } from "./errors.mjs"
import { validateCaptureEvent } from "./local-validation.mjs"

export function createMemactClient(config = {}) {
  const baseUrl = String(config.baseUrl || "").replace(/\/+$/, "")
  if (!baseUrl) throw new MemactSDKError("baseUrl is required", { code: "missing_base_url" })
  const fetchImpl = config.fetchImpl || globalThis.fetch
  if (typeof fetchImpl !== "function") throw new MemactSDKError("fetch is not available", { code: "missing_fetch" })

  const request = async (path, { method = "GET", body, connectionId = config.connectionId } = {}) => {
    const headers = { "Content-Type": "application/json" }
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`
    if (connectionId) headers["X-Memact-Connection-Id"] = connectionId
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    const text = await response.text()
    const payload = text ? JSON.parse(text) : {}
    if (!response.ok) {
      throw new MemactSDKError(payload?.error?.message || "Memact request failed", {
        status: response.status,
        code: payload?.error?.code || "memact_request_failed",
        details: payload
      })
    }
    return payload
  }

  return {
    capture(event = {}) {
      const body = {
        schema_version: "memact.capture_event.v0",
        source_app: event.source_app || config.appId || "app",
        app_id: event.app_id || config.appId,
        occurred_at: event.occurred_at || new Date().toISOString(),
        ...event
      }
      const validation = validateCaptureEvent(body)
      if (!validation.ok) throw new MemactSDKError(validation.errors.join(", "), { code: "invalid_capture_event" })
      return request("/v1/capture/events", { method: "POST", body, connectionId: event.connection_id || config.connectionId })
    },
    verifyAccess(options = {}) {
      return request("/v1/access/verify", { method: "POST", body: options, connectionId: options.connection_id || config.connectionId })
    },
    runFeature(featureId, input = {}, options = {}) {
      return request(`/v1/features/${encodeURIComponent(featureId)}/run`, {
        method: "POST",
        body: {
          connection_id: options.connection_id || config.connectionId,
          activity_categories: options.activity_categories || [],
          input
        },
        connectionId: options.connection_id || config.connectionId
      })
    },
    getFeatures() {
      return request("/v1/features")
    },
    getSchemas(options = {}) {
      return request(withQuery("/v1/schemas", options), { connectionId: options.connection_id || config.connectionId })
    },
    listSchemas(options = {}) {
      return request(withQuery("/v1/schemas", options), { connectionId: options.connection_id || config.connectionId })
    },
    addSchema(schema = {}, options = {}) {
      return request("/v1/schemas", {
        method: "POST",
        body: schema,
        connectionId: options.connection_id || config.connectionId
      })
    },
    addSubSchema(schemaId, subSchema = {}, options = {}) {
      if (!schemaId) throw new MemactSDKError("schemaId is required", { code: "missing_schema_id" })
      return request(`/v1/schemas/${encodeURIComponent(schemaId)}/subschemas`, {
        method: "POST",
        body: subSchema,
        connectionId: options.connection_id || config.connectionId
      })
    },
    getSchema(schemaId, options = {}) {
      if (!schemaId) throw new MemactSDKError("schemaId is required", { code: "missing_schema_id" })
      return request(withQuery(`/v1/schemas/${encodeURIComponent(schemaId)}`, options), { connectionId: options.connection_id || config.connectionId })
    },
    getMemory(options = {}) {
      return request(withQuery("/v1/memory", options), { connectionId: options.connection_id || config.connectionId })
    }
  }
}

function withQuery(path, options = {}) {
  const params = new URLSearchParams()
  if (options.connection_id) params.set("connection_id", options.connection_id)
  if (Array.isArray(options.activity_categories)) params.set("activity_categories", options.activity_categories.join(","))
  const query = params.toString()
  return query ? `${path}?${query}` : path
}
