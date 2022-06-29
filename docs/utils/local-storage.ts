export function getFromLocalStorage(key: string) {
  if (typeof window !== "undefined" && window?.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export function saveToLocalStorage(key: string, value: string) {
  if (typeof window !== "undefined" && window?.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // TODO: Log to sentry.
      console.error(error);
    }
  }
}

export function removeFromLocalStorage(key: string) {
  if (typeof window !== "undefined" && window?.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  }
}
