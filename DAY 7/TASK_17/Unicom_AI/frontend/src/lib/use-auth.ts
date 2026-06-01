import { useEffect, useState } from "react";
import type { Role } from "./use-role";
import { setRole } from "./use-role";

const KEY = "ucom.auth";
const NAME_KEY = "ucom.name";

type AuthState = { authed: boolean; role: Role | null; name: string | null };

const listeners = new Set<() => void>();

export function getAuth(): AuthState {
  if (typeof window === "undefined") return { authed: false, role: null, name: null };
  const raw = localStorage.getItem(KEY);
  if (!raw) return { authed: false, role: null, name: null };
  try {
    const v = JSON.parse(raw) as { role: Role };
    return { authed: true, role: v.role, name: localStorage.getItem(NAME_KEY) };
  } catch {
    return { authed: false, role: null, name: null };
  }
}

export function signIn(role: Role, name: string) {
  localStorage.setItem(KEY, JSON.stringify({ role }));
  localStorage.setItem(NAME_KEY, name);
  setRole(role);
  listeners.forEach((l) => l());
}

export function signOut() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(NAME_KEY);
  listeners.forEach((l) => l());
}

export function useAuth(): AuthState {
  const [s, setS] = useState<AuthState>(() => getAuth());
  useEffect(() => {
    const fn = () => setS(getAuth());
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return s;
}