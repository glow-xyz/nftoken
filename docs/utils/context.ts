import { Context, useContext } from "react";

export function createUseAppContext<ContextValue>(
  context: Context<ContextValue>
): () => NonNullable<ContextValue> {
  return function useAppContext() {
    const value = useContext(context);

    if (!value) {
      return {} as NonNullable<ContextValue>;
    }

    return value as NonNullable<ContextValue>;
  };
}
