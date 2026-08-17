// redirect /help to DocumentCloud User Guide

import { redirect } from "@sveltejs/kit";
import { HELP } from "@/config/config.js";

export const trailingSlash = "ignore";

export function GET() {
  return redirect(308, HELP.home);
}
