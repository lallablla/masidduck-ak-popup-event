import { useMutation, useQuery } from "@tanstack/react-query";

export const SETTINGS_QUERY_KEY = ["settings"];

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error ?? `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export function useGetSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => apiFetch<any>("/api/settings"),
    staleTime: 30_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: (vars: { data: any }) =>
      apiFetch<any>("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars.data),
      }),
  });
}

export function useTrackEvent() {
  return useMutation({
    mutationFn: (vars: { data: any }) =>
      apiFetch<any>("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars.data),
      }),
  });
}

export function useGetAnalytics() {
  return useMutation({
    mutationFn: (vars: { data: any }) =>
      apiFetch<any>("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars.data),
      }),
  });
}

export function getGetSettingsQueryKey() {
  return SETTINGS_QUERY_KEY;
}
