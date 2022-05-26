import React, { createContext, useEffect, useState } from "react";

type User = { address: string };

type Context = {
  user: User | null;
  hasGlow: boolean;

  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const UserContext = createContext<Context | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [hasGlow, setHasGlow] = useState(true);
  useEffect(() => {
    let timeout: number | undefined = undefined;

    if (window.glow) {
      setHasGlow(true);
    } else {
      setHasGlow(false);

      timeout = window.setTimeout(() => {
        if (window.glow) {
          setHasGlow(true);
        }
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async () => {
    if (!window.glow) {
      return;
    }

    try {
      const data = await window.glow.signIn();
      setUser({ address: data.address });
    } catch {}
  };

  const signOut = async () => {
    if (!window.glow) {
      return;
    }

    await window.glow.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, hasGlow, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
};
