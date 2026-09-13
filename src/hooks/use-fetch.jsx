import { useSession } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook that wraps an async API call with Clerk auth token handling.
 * Returns { data, loading, error, fn } where `fn` is stable across renders
 * (safe to use in useEffect dependency arrays).
 */
const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const { session } = useSession();

  // Always read the latest callback/options without invalidating `fn`
  const cbRef = useRef(cb);
  const optionsRef = useRef(options);

  useEffect(() => {
    cbRef.current = cb;
    optionsRef.current = options;
  });

  const fn = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const supabaseAccessToken = await session?.getToken({
          template: "supabase",
        });
        const response = await cbRef.current(
          supabaseAccessToken,
          optionsRef.current,
          ...args,
        );
        setData(response);
        setError(null);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  return { data, loading, error, fn };
};

export default useFetch;
