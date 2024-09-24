import { BASE_API_URL } from "@/config/config";
import type { Flatpage } from "./types";

export async function getTipOfDay(
  fetch = globalThis.fetch,
): Promise<Flatpage | undefined> {
  const endpoint = new URL("flatpages/tipofday/", BASE_API_URL);
  try {
    const resp = await fetch(endpoint, { credentials: "include" });
    if (!resp.ok) return;
    return resp.json();
  } catch (e) {
    return;
  }
}
