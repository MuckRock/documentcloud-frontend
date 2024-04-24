import { CSRF_COOKIE_NAME } from "@/config/config";

export function load({ cookies }) {
  const csrf_token = cookies.get(CSRF_COOKIE_NAME);

  return { csrf_token };
}
