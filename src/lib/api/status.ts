/** Cached backend capability check (Redis + auth), shared across the client. */

interface BackendStatus {
  enabled: boolean;
  auth: boolean;
}

let cached: Promise<BackendStatus> | null = null;

async function fetchStatus(): Promise<BackendStatus> {
  try {
    const res = await fetch("/api/events/status", { cache: "no-store" });
    if (!res.ok) return { enabled: false, auth: false };
    const data = (await res.json()) as Partial<BackendStatus>;
    return { enabled: !!data.enabled, auth: !!data.auth };
  } catch {
    return { enabled: false, auth: false };
  }
}

export function getBackendStatus(): Promise<BackendStatus> {
  if (!cached) cached = fetchStatus();
  return cached;
}

export async function isRemoteEventsEnabled(): Promise<boolean> {
  return (await getBackendStatus()).enabled;
}

export async function isAuthEnabled(): Promise<boolean> {
  return (await getBackendStatus()).auth;
}

export function resetBackendStatusCache(): void {
  cached = null;
}
