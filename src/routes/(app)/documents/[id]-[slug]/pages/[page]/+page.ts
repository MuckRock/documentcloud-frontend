// this route was sometimes generated by old embeds and should redirect

import { redirect } from "@sveltejs/kit";
import { EMBED_URL } from "@/config/config.js";

export function load({ params }) {
  const { id, page } = params;

  // if this is a 404, the embed route will handle it
  const url = new URL(`/documents/${id}/pages/${page}/?embed=1`, EMBED_URL);

  return redirect(302, url);
}