export class MemactSDKError extends Error {
  constructor(message, { status = 0, code = "memact_sdk_error", details = null } = {}) {
    super(message)
    this.name = "MemactSDKError"
    this.status = status
    this.code = code
    this.details = details
  }
}
