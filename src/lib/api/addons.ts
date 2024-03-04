import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { type AddOnListItem } from "@/addons/types";
import { isErrorCode } from "../utils";
import type { Page } from "@/api/types/common";

export async function getPinnedAddons(): Promise<Page<AddOnListItem>> {
  const endpoint = new URL(
    "/api/addons/?active=true&per_page=100",
    BASE_API_URL,
  );
  const resp = await fetch(endpoint, { credentials: "include" });
  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }
  return resp.json();
}
