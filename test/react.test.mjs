import test from "node:test"
import assert from "node:assert/strict"
import { MemactProvider, useContextClaim } from "../src/react.mjs"

test("useContextClaim returns error if executed outside of running React engine environment context", () => {
  // Ensure runtime does not find React primitive structures
  const originalGlobalReact = globalThis.React;
  delete globalThis.React;

  try {
    const result = useContextClaim("developer_work", {});
    assert.ok(result.error);
    assert.match(result.error.message, /React instance not found/);
  } finally {
    globalThis.React = originalGlobalReact;
  }
});

test("useContextClaim executes queries correctly under mock structural injection passes", async () => {
  let queriesPassed = [];
  let trackingClocksCleared = false;

  const mockClient = {
    connectionId: "conn_react_isolated_suite",
    async getAllowedMemory(payload) {
      queriesPassed.push(payload);
      return { ok: true, claims: ["react-hook-isolated-assertion-token"] };
    }
  };

  // Construct a clean mock loop mimicking state transformations
  let hookEffectClosure = null;
  const mockReactEngine = {
    useState(initial) {
      let val = initial;
      const setter = (newVal) => { val = newVal; };
      return [val, setter];
    },
    useEffect(effectClosure) {
      hookEffectClosure = effectClosure;
    }
  };

  // Inject structural duck parameters natively onto global scope path
  globalThis.React = mockReactEngine;

  try {
    // Invoke hook with custom client option override injection path mapping
    const result = useContextClaim("music", { client: mockClient });
    
    // Fire structural lifecycle trigger hooks
    if (typeof hookEffectClosure === "function") {
      const cleanupFn = await hookEffectClosure();
      if (typeof cleanupFn === "function") {
        cleanupFn();
        trackingClocksCleared = true;
      }
    }

    assert.equal(queriesPassed.length, 1);
    assert.equal(queriesPassed[0].connection_id, "conn_react_isolated_suite");
    assert.deepEqual(queriesPassed[0].activity_categories, ["music"]);
    assert.ok(trackingClocksCleared);
  } finally {
    delete globalThis.React;
  }
});