export class MemactSDKError extends Error {
  constructor(message, { status = 0, code = "memact_sdk_error", details = null } = {}) {
    super(message)
    this.name = "MemactSDKError"
    this.status = status
    this.code = code
    this.details = details
  }
}

const loggedWarnings = new Set();

export function logDeprecationWarning(featureName, alternative) {
  if (!loggedWarnings.has(featureName)) {
    console.warn(`[Memact SDK Warning]: "${featureName}" is deprecated and will be removed in a future release. Please use "${alternative}" instead.`);
    loggedWarnings.add(featureName);
  }
}