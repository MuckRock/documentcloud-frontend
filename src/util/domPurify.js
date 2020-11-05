import { Svue } from 'svue';

export const domPurify = new Svue({
  data() {
    return {
      domPurify: null,
    }
  }
});

export function loadDompurify() {
  import("dompurify").then((module) => {
    domPurify.domPurify = module;
  });
}
