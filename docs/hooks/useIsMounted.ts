import { useEffect, useState } from "react";

/**
 * Return isMounted=true after the component has had a chance to render
 *
 * We use this hook to run actions after the first load. This also lets us run code on the client
 * that will not run on the server (because the server does not mount components).
 */
export const useIsMounted = (): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};
