/**
 * Safe reference helper to pull the running React instance.
 * Checks typeof window first to guarantee absolute safety in Node environment tests.
 */
const getReactInstance = () => {
  if (typeof window !== "undefined" && window.React) return window.React;
  if (typeof globalThis !== "undefined" && globalThis.React) return globalThis.React;
  return null;
};

// 1. FIXED: Creating the shared stable context instance OUTSIDE of the rendering cycle
let SharedMemactContext = null;

const getContextInstance = (R) => {
  if (!SharedMemactContext && R && typeof R.createContext === "function") {
    SharedMemactContext = R.createContext(null);
  }
  return SharedMemactContext;
};

export function MemactProvider({ client, children }) {
  if (!client) {
    console.warn("[Memact SDK] MemactProvider was mounted without a valid client instance.");
  }
  
  const R = getReactInstance();
  const Context = getContextInstance(R);
  
  // If running in an active React environment, cleanly create the element provider
  if (R && Context) {
    return R.createElement(Context.Provider, { value: client }, children);
  }
  
  return children;
}

/**
 * Custom React hook subscribing to live context state updates and claims.
 * @param {string} category - The domain category filtering scope (e.g., 'developer_work', 'music')
 * @param {Object} options - Subscriptions modifiers and query configuration hooks
 */
export function useContextClaim(category, options = {}) {
  const R = getReactInstance();
  const Context = getContextInstance(R);
  
  if (!R || !Context) {
    return { 
      claim: null, 
      loading: false, 
      error: new Error("React instance not found. Ensure this hook is executed inside a running React application environment.") 
    };
  }

  // 3. FIXED: Extract client via React.useContext from our stable, outer context instance
  const client = R.useContext(Context);
  
  const [claim, setClaim] = R.useState(null);
  const [loading, setLoading] = R.useState(true);
  const [error, setError] = R.useState(null);

  R.useEffect(() => {
    if (!client) {
      setError(new Error("useContextClaim must be used within a MemactProvider element tree."));
      setLoading(false);
      return;
    }

    if (!category) {
      setError(new Error("category parameter is required for state management filtering."));
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchCurrentClaim = async () => {
      try {
        const connectionId = options.connection_id || client.connectionId;
        const result = await client.getAllowedMemory({
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
  }, [client, category, JSON.stringify(options)]);

  return { claim, loading, error };
}