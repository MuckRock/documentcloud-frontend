import { Svue } from "svue";

export const domPurify = new Svue({
  data() {
    return {
      domPurify: null,
    };
  },
});

export async function loadDompurify() {
  if (domPurify.domPurify !== null) return;
  return import("dompurify").then((module) => {
    domPurify.domPurify = module.default ? module.default : module;
  });
}
