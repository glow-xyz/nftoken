import { useCallback, useState } from "react";

export const useBoolean = (
  initialValue = false
): {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (val: boolean) => void;
  toggle: () => void;
} => {
  const [value, setValue] = useState<boolean>(initialValue);
  const setTrue = useCallback(() => {
    setValue(true);
  }, [setValue]);
  const setFalse = useCallback(() => {
    setValue(false);
  }, [setValue]);
  const toggle = useCallback(() => {
    setValue((val) => !val);
  }, [setValue]);

  return {
    value,
    setTrue,
    setFalse,
    setValue,
    toggle,
  };
};
