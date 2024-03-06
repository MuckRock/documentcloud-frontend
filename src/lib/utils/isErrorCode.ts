import type { NumericRange } from "@sveltejs/kit";

export function isErrorCode(status: number): status is NumericRange<400, 599> {
  return status >= 400 && status <= 599;
}
