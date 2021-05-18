import { Svue } from "svue";

let globalToastIdx = 0;

export const toasts = new Svue({
  data() {
    return {
      toasts: [],
    };
  },
});

export function pushToast(content) {
  toasts.toasts = [
    ...toasts.toasts,
    {
      idx: globalToastIdx++,
      content,
    },
  ];
}

export function dismiss(toastIdx) {
  toasts.toasts.splice(toastIdx, 1);
  toasts.toasts = toasts.toasts;
}
