import type { Org } from "@/api/types";

export default function isOrg(o: number | Org): o is Org {
  if (typeof o === "number") return false;
  return true;
}
