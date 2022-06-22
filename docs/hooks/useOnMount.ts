import { EffectCallback, useEffect } from "react";

export const useOnMount = (callback: EffectCallback) => {
  useEffect(() => {
    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
