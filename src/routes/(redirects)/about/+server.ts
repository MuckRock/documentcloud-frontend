// redirect /about to /home/
import { redirect } from "@sveltejs/kit";

export const trailingSlash = "ignore";

export function GET() {
  redirect(301, "/home/");
}
