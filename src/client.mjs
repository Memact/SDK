import crypto from "node:crypto";
import { MemactSDKError, logDeprecationWarning } from "./errors.mjs";
import { validateCaptureEvent } from "./local-validation.mjs";
import { validateClientConfig } from "./config-validation.mjs";

export class MemactClient {
  static async connect(identityAddress, config = {}) {
    let baseUrl = config.baseUrl || "http://localhost:3000";
    if (identityAddress && identityAddress.includes("@")) {
      const domain = identityAddress.split("@")[1];
      if (domain !== "localhost" && domain !== "memact.com") {
        baseUrl = `https://${domain}`;
      }
    }
    const clientConfig = { ...config, baseUrl };
    return new MemactClient(clientConfig);
  }

  constructor(config = {}) {
    const validation = validateClientConfig(config);
    if (!validation.ok) {
      throw new MemactSDKError(validation.errors.join(", "), { code: "invalid_client_config" });
    }
    this.config = config;
    this.baseUrl = String(config.baseUrl || "").replace(/\/+$/, "");
    if (!this.baseUrl) throw new MemactSDKError("baseUrl is required", { code: "missing_base_url" });
    this.fetchImpl = config.fetchImpl || globalThis.fetch;
    if (typeof this.fetchImpl !== "function") throw new MemactSDKError("fetch is not available", { code: "missing_fetch" });
  }

  async _request(path, { method = "GET", body, connectionId = this.config.connectionId } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (this.config.apiKey) headers.Authorization = `Bearer ${this.config.apiKey}`;
    if (connectionId) headers["X-Memact-Connection-Id"] = connectionId;
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new MemactSDKError(payload?.error?.message || "Memact request failed", {
        status: response.status,
        code: payload?.error?.code || "memact_request_failed",
        details: payload
      });
    }
    return payload;
  }

  async requestContext(params = {}) {
    const body = {
      connection_id: params.connection_id || this.config.connectionId,
      request_id: params.request_id || `req_${Math.random().toString(36).slice(2)}`,
      app_id: params.app_id || this.config.appId,
      purpose: params.purpose || "general_context",
      requested_context: params.requested_context || params.fields?.map(f => ({ description: f, required: true })) || [],
      categories: params.categories || []
    };
    return this._request("/v1/cap/request", {
      method: "POST",
      body,
      connectionId: body.connection_id
    });
  }

  async contribute(params = {}) {
    const body = {
      category: params.category || "general",
      field: params.field || "",
      value: params.value,
      entry_type: params.entry_type || "app_observation",
      evidence: params.evidence || {},
      connection_id: params.connection_id || this.config.connectionId
    };
    return this._request("/v1/contributions/propose", {
      method: "POST",
      body,
      connectionId: body.connection_id
    });
  }
}

export function createMemactClient(config = {}) {
  const validation = validateClientConfig(config);
  if (!validation.ok) {
    throw new MemactSDKError(validation.errors.join(", "), { code: "invalid_client_config" });
  }

  const baseUrl = String(config.baseUrl || "").replace(/\/+$/, "");
  if (!baseUrl) throw new MemactSDKError("baseUrl is required", { code: "missing_base_url" });
  const fetchImpl = config.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new MemactSDKError("fetch is not available", { code: "missing_fetch" });

  // Internal E2EE Key Session Tracking
  let activeSessionKeyPair = null;
  let activeOAuthToken = null;

  const request = async (path, { method = "GET", body, connectionId = config.connectionId, useToken = false } = {}) => {
    const headers = { "Content-Type": "application/json" };
    
    // FEATURE (#91): Bind active token to the Authorization header if specified
    if (useToken && activeOAuthToken) {
      headers.Authorization = `Bearer ${activeOAuthToken}`;
    } else if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }
    
    if (connectionId) headers["X-Memact-Connection-Id"] = connectionId;
    
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new MemactSDKError(payload?.error?.message || "Memact request failed", {
        status: response.status,
        code: payload?.error?.code || "memact_request_failed",
        details: payload
      });
    }
    return payload;
  };

  const client = {
    capture(event = {}) {
      const body = {
        schema_version: "memact.capture_event.v0",
        source_app: event.source_app || config.appId || "app",
        app_id: event.app_id || config.appId,
        occurred_at: event.occurred_at || new Date().toISOString(),
        ...event
      };
      const validation = validateCaptureEvent(body);
      if (!validation.ok) throw new MemactSDKError(validation.errors.join(", "), { code: "invalid_capture_event" });
      return request("/v1/capture/events", { method: "POST", body, connectionId: event.connection_id || config.connectionId });
    },
    sendSignal(signal = {}, options = {}) {
      const body = {
        connection_id: options.connection_id || signal.connection_id || config.connectionId,
        raw_signal: {
          schema_version: "memact.app_context_signal.v0",
          source_app: signal.source_app || config.appId || "app",
          occurred_at: signal.occurred_at || new Date().toISOString(),
          ...signal
        }
      };
      return request("/v1/wiki/proposals", { method: "POST", body, connectionId: body.connection_id });
    },
    sendAppActivity(activity = {}, options = {}) {
      logDeprecationWarning("sendAppActivity", "sendSignal");
      return this.sendSignal(activity, options);
    },
    proposeContext(proposal = {}, options = {}) {
      const body = {
        connection_id: options.connection_id || proposal.connection_id || config.connectionId,
        proposal: {
          source_app: proposal.source_app || config.appId || "app",
          ...proposal
        }
      };
      return request("/v1/wiki/proposals", { method: "POST", body, connectionId: body.connection_id });
    },
    suggestMemory(proposal = {}, options = {}) {
      const body = {
        connection_id: options.connection_id || proposal.connection_id || config.connectionId,
        proposal: {
          source_app: proposal.source_app || config.appId || "app",
          ...proposal
        }
      };
      return request("/v1/memory/suggestions", { method: "POST", body, connectionId: body.connection_id });
    },
    proposeWikiEntry(proposal = {}, options = {}) {
      logDeprecationWarning("proposeWikiEntry", "suggestMemory");
      return this.suggestMemory(proposal, options);
    },
    proposeSuggestion(proposal = {}, options = {}) {
      logDeprecationWarning("proposeSuggestion", "suggestMemory");
      return this.suggestMemory(proposal, options);
    },
    proposeContextSuggestion(proposal = {}, options = {}) {
      logDeprecationWarning("proposeContextSuggestion", "proposeContext");
      return this.proposeContext(proposal, options);
    },
    
    // FEATURE (#91): Upgrade verifyAccess to sign payloads if an active E2EE session exists
    verifyAccess(options = {}) {
      let outboundBody = { ...options };

      if (activeSessionKeyPair && activeSessionKeyPair.privateKey) {
        const timestamp = new Date().toISOString();
        const payloadToSign = JSON.stringify({
          ...options,
          timestamp,
          connection_id: options.connection_id || config.connectionId
        });

        try {
          const signature = crypto.sign(
            "sha256",
            Buffer.from(payloadToSign),
            {
              key: activeSessionKeyPair.privateKey,
              padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            }
          ).toString("base64");

          outboundBody = {
            encrypted_payload: payloadToSign,
            signature,
            algo: "RSA-PSS-SHA256"
          };
        } catch (err) {
          throw new MemactSDKError(`Cryptographic E2EE wrapping failed: ${err.message}`, {
            code: "crypto_verification_failed"
          });
        }
      }

      return request("/v1/access/verify", { 
        method: "POST", 
        body: outboundBody, 
        connectionId: options.connection_id || config.connectionId,
        useToken: true 
      });
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
      });
    },
    getFeatures() {
      return request("/v1/features");
    },
    listContext(options = {}) {
      return request(withQuery("/v1/context", options), { connectionId: options.connection_id || config.connectionId });
    },
    getContextCategories(options = {}) {
      return request(withQuery("/v1/context", options), { connectionId: options.connection_id || config.connectionId });
    },
    addContextCategory(context = {}, options = {}) {
      return request("/v1/context", {
        method: "POST",
        body: context,
        connectionId: options.connection_id || config.connectionId
      });
    },
    addSubContext(contextId, subContext = {}, options = {}) {
      if (!contextId) throw new MemactSDKError("contextId is required", { code: "missing_context_id" });
      return request(`/v1/context/${encodeURIComponent(contextId)}/subcontexts`, {
        method: "POST",
        body: subContext,
        connectionId: options.connection_id || config.connectionId
      });
    },
    getContext(contextId, options = {}) {
      if (!contextId) throw new MemactSDKError("contextId is required", { code: "missing_context_id" });
      return request(withQuery(`/v1/context/${encodeURIComponent(contextId)}`, options), { connectionId: options.connection_id || config.connectionId });
    },
    getSchemas(options = {}) {
      return request(withQuery("/v1/schemas", options), { connectionId: options.connection_id || config.connectionId });
    },
    listSchemas(options = {}) {
      return request(withQuery("/v1/schemas", options), { connectionId: options.connection_id || config.connectionId });
    },
    addSchema(schema = {}, options = {}) {
      return request("/v1/schemas", {
        method: "POST",
        body: schema,
        connectionId: options.connection_id || config.connectionId
      });
    },
    addSubSchema(schemaId, subSchema = {}, options = {}) {
      if (!schemaId) throw new MemactSDKError("schemaId is required", { code: "missing_schema_id" });
      return request(`/v1/schemas/${encodeURIComponent(schemaId)}/subschemas`, {
        method: "POST",
        body: subSchema,
        connectionId: options.connection_id || config.connectionId
      });
    },
    getSchema(schemaId, options = {}) {
      if (!schemaId) throw new MemactSDKError("schemaId is required", { code: "missing_schema_id" });
      return request(withQuery(`/v1/schemas/${encodeURIComponent(schemaId)}`, options), { connectionId: options.connection_id || config.connectionId });
    },
    getMemory(options = {}) {
      return request(withQuery("/v1/memory", options), { connectionId: options.connection_id || config.connectionId });
    },
    getAllowedMemory(options = {}) {
      return this.getMemory(options);
    },
    getCredits() {
      return request("/v1/credits");
    },
    requestContext(params = {}) {
      return request("/v1/cap/request", {
        method: "POST",
        body: {
          connection_id: params.connection_id || config.connectionId,
          request_id: params.request_id || `req_${Math.random().toString(36).slice(2)}`,
          app_id: params.app_id || config.appId,
          purpose: params.purpose || "general_context",
          requested_context: params.requested_context || params.fields?.map(f => ({ description: f, required: true })) || [],
          categories: params.categories || []
        },
        connectionId: params.connection_id || config.connectionId
      });
    },
    contribute(params = {}) {
      return request("/v1/contributions/propose", {
        method: "POST",
        body: {
          category: params.category || "general",
          field: params.field || "",
          value: params.value,
          entry_type: params.entry_type || "app_observation",
          evidence: params.evidence || {},
          connection_id: params.connection_id || config.connectionId
        },
        connectionId: params.connection_id || config.connectionId
      });
    }
  };

  // FEATURE (#91): Dedicated OAuth Flow handling asymmetric key registrations for E2EE context
  client.e2ee = {
    async initializeSession(token, keyPair = {}) {
      if (!token) throw new MemactSDKError("A valid OAuth token is required to initialize an E2EE session", { code: "missing_oauth_token" });
      if (!keyPair.publicKey || !keyPair.privateKey) {
        throw new MemactSDKError("A valid asymmetric key pair bundle is required for E2EE context validation", { code: "invalid_key_pair" });
      }
      
      activeOAuthToken = token;
      activeSessionKeyPair = keyPair;

      return request("/v1/oauth/e2ee/keys", {
        method: "POST",
        body: { public_key: keyPair.publicKey },
        useToken: true
      });
    },
    clearSession() {
      activeSessionKeyPair = null;
      activeOAuthToken = null;
    }
  };

  return client;
}

function withQuery(path, options = {}) {
  const params = new URLSearchParams();
  if (options.connection_id) params.set("connection_id", options.connection_id);
  if (Array.isArray(options.activity_categories)) params.set("activity_categories", options.activity_categories.join(","));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
