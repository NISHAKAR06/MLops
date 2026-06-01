/**
 * API base URL resolution.
 *
 * - In Docker (or any deployment): all requests go through Nginx at the same
 *   origin, so we use relative paths (e.g. /api/..., /uploads/..., /ws/...).
 * - In local dev (npm run dev): the Vite dev server runs on a different port
 *   from the FastAPI backend, so we fall back to localhost:8000.
 *
 * The VITE_API_BASE_URL env var is empty string in Docker (relative paths),
 * and can be set to http://localhost:8000 for local dev if needed.
 */

const isDev =
  typeof import.meta !== "undefined" &&
  (import.meta as any).env?.DEV === true;

// In Docker, VITE_API_BASE_URL is not set → empty string → relative paths.
// In local dev without the env var, fall back to localhost:8000.
export const API_BASE: string =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_BASE_URL) ||
  (isDev ? "http://localhost:8000" : "");

/**
 * WebSocket base URL.
 * Derives from the current window location so it works in any deployment.
 */
export function getWsBase(): string {
  if (typeof window === "undefined") return "ws://localhost:8000";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host; // e.g. localhost or yourdomain.com
  return `${proto}//${host}`;
}
