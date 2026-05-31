import { useEffect, useState } from "react";

export type Role = "seller" | "admin";
const KEY = "ucom.role";

const listeners = new Set<() => void>();

export function getRole(): Role {
  if (typeof window === "undefined") return "seller";
  return (localStorage.getItem(KEY) as Role) ?? "seller";
}

export function setRole(role: Role) {
  localStorage.setItem(KEY, role);
  listeners.forEach((l) => l());
}

export function useRole(): [Role, (r: Role) => void] {
  const [role, setLocal] = useState<Role>(() => getRole());
  useEffect(() => {
    const fn = () => setLocal(getRole());
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return [role, setRole];
}