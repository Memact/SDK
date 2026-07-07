/**
 * Global fallback or structural bindings for React primitives.
 * This prevents runtime crash failures in non-React vanilla environments.
 */
const ReactInstance = typeof window !== "undefined" && window.React ? window.React : null;

// Context provider backing fallback constructor block
const DummyContext = { Provider: function({ value, children }) { return children; } };
export const MemactContext = { Provider: DummyContext.Provider };

export function MemactProvider({ client, children }) {
  if (!client) {
    console.warn("[Memact SDK] MemactProvider was mounted without a valid client instance.");
  }
  
  // Use dynamically injected React instances if present, otherwise handle structure ducks
  const R = ReactInstance || (typeof globalThis !== "undefined" && globalThis.React);
  if (R && typeof R.createContext === "function") {
    return R.createElement(R.createContext(null).Provider, { value: client }, children);
  }
  
  return children;
}

/**
 * Custom React hook subscribing to live context state updates and claims.
 * @param {string} category - The domain category filtering scope (e.g., 'developer_work', 'music')
 * @param {Object} options - Subscriptions modifiers and query configuration hooks
 */
export function useContextClaim(category, options = {}) {
  // Grab standard state primitives gracefully from global contextual environment injections
  const R = ReactInstance || (typeof globalThis !== "undefined" && globalThis.React);
  
  if (!R) {
    return { claim: null, loading: false, error: new Error("React instance not found. Ensure this hook is executed inside a running React application environment.") };
  }

  // Use structural hook bindings natively at runtime
  const [claim, setClaim] = R.useState(null);
  const [loading, setLoading] = R.useState(true);
  const [error, setError] = R.useState(null);

  R.useEffect(() => {
    // Structural runtime safety constraints checks
    if (!category) {
      setError(new Error("category parameter is required for state management filtering."));
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchCurrentClaim = async () => {
      try {
        // Dynamic evaluation pass
        const contextClient = typeof options.client === "object" ? options.client : null;
        if (!contextClient) {
          throw new Error("useContextClaim must be used within a MemactProvider element tree.");
        }

        const connectionId = options.connection_id || contextClient.connectionId;
        const result = await contextClient.getAllowedMemory({
          connection_id: connectionId,
          activity_categories: [category],
          ...options
        });
        
        if (isMounted) {
          setClaim(result || null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentClaim();

    const liveIntervalMs = options.pollInterval || 4000;
    const trackerClockId = setInterval(fetchCurrentClaim, liveIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(trackerClockId);
    };
  }, [category, JSON.stringify(options)]);

  return { claim, loading, error };
}