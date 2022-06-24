import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../utils/local-storage";
import { useCallback, useState } from "react";

export const usePersistedState = (
  key: string,
  defaultValue?: string
): [value: string | null, setValue: (newValue: string) => void] => {
  const [value, setCachedValue] = useState(() => {
    const item = getFromLocalStorage(key);
    if (item === null) {
      return defaultValue;
    }

    return item;
  });

  const setValue = useCallback(
    (newValue: string) => {
      setCachedValue(newValue);
      saveToLocalStorage(key, newValue);
    },
    [key, setCachedValue]
  );

  return [value!, setValue];
};
