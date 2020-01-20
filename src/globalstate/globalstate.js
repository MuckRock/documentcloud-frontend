import { Svue } from "svue";

// Stores
import { manager } from "@/manager/manager";
import { renderer } from "@/viewer/renderer";
import { viewer } from "@/viewer/viewer";
import { router } from "@/router/router";
import { ticker } from "@/ticker/ticker";

export const globalState = new Svue({
  data() {
    return {
      manager,
      viewer,
      renderer,
      router,
      ticker
    };
  }
});
