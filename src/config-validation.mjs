export function validateClientConfig(config = {}) {
  const errors = []

  if (!config.baseUrl || typeof config.baseUrl !== "string") {
    errors.push("baseUrl is required and must be a string")
  }

  if (config.apiKey !== undefined && typeof config.apiKey !== "string") {
    errors.push("apiKey must be a string when provided")
  }

  if (config.appId !== undefined && typeof config.appId !== "string") {
    errors.push("appId must be a string when provided")
  }

  if (config.connectionId !== undefined && typeof config.connectionId !== "string") {
    errors.push("connectionId must be a string when provided")
  }

  return { ok: errors.length === 0, errors }
}