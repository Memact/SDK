import { logDeprecationWarning } from "./errors.mjs"

export function validateCaptureEvent(event) {
  const errors = []
  if (!event?.event_type) errors.push("event_type is required")
  if (!event?.source_app) errors.push("source_app is required")
  if (!event?.occurred_at) errors.push("occurred_at is required")
  if (!event?.category) errors.push("category is required")
  if (!event?.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) errors.push("payload object is required")

  if (event?.schema_version === "memact.capture_event.v0") {
    logDeprecationWarning("schema_version: memact.capture_event.v0", "memact.capture_event.v1");
  }

  return { ok: errors.length === 0, errors }
}
