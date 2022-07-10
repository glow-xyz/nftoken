import { useEffect, useRef } from "react";
import { useOnMount } from "./useOnMount";

// From here https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// If intervalMs is null, then we will not run the loop
export const usePolling = (
  callback: () => void,
  intervalMs: number | null,
  { runOnMount }: { runOnMount: boolean } = { runOnMount: false }
) => {
  const savedCallback = useRef<() => void>(() => null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useOnMount(() => {
    if (runOnMount) {
      callback();
    }
  });

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (intervalMs != null) {
      const id = setInterval(tick, intervalMs);
      return () => clearInterval(id);
    }

    return undefined;
  }, [intervalMs]);
};
