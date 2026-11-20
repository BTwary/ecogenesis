"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/client";

export interface PublicUser {
  id: string;
  email: string | null;
  name: string | null;
  accountType: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface SessionCtx {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
}

const Ctx = createContext<SessionCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  authOpen: false,
  setAuthOpen: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const d = await api<{ user: PublicUser }>("/api/auth/me");
      setUser(d.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <Ctx.Provider value={{ user, loading, refresh, authOpen, setAuthOpen }}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}
