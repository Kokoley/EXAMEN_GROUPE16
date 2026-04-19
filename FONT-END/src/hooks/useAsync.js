import { useCallback, useState } from "react";

export function useAsyncFn(fn, deps = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setLoading(false);
        return result;
      } catch (e) {
        setError(e);
        setLoading(false);
        throw e;
      }
    },
    deps
  );

  return { loading, error, run, setError };
}
