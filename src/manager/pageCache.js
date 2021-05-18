import { Svue } from "svue";
import { getFlatpage } from "@/api/cms";

export const pageCache = new Svue({
  data() {
    return {
      grabbingTip: false,
      tipResponse: null,
    };
  },
});

export async function grabTipOfDay() {
  if (pageCache.grabbingTip) return;

  pageCache.grabbingTip = true;
  const data = await getFlatpage(process.env.TIP_OF_THE_DAY);
  pageCache.tipResponse = data;
  // Trigger resize to fix menu position
  window.dispatchEvent(new Event("resize"));
}
