import { redirect } from "@sveltejs/kit";
import { DC_BASE } from "@/config/config.js";

export const trailingSlash = "never";

export async function GET({ url }) {
  const oembed = new URL("/api/oembed/", DC_BASE);

  oembed.search = url.search;

  return redirect(308, oembed);
}
