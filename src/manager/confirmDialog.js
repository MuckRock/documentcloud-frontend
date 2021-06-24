import { Svue } from "svue";

export const confirmDialog = new Svue({
  data() {
    return {
      open: false,
      title: "",
      body: "",
      buttonText: "",
      confirmFn: null,
      translateValues: {},
    };
  },
});

export function showConfirm(
  title,
  body,
  buttonText,
  confirmFn,
  translateValues = {},
) {
  confirmDialog.title = title;
  confirmDialog.body = body;
  confirmDialog.buttonText = buttonText;
  confirmDialog.confirmFn = confirmFn;
  confirmDialog.open = true;
  confirmDialog.translateValues = translateValues;
}

export function runConfirm() {
  if (confirmDialog.confirmFn != null) {
    confirmDialog.confirmFn();
  }
  hideConfirm();
}

export function hideConfirm() {
  confirmDialog.confirmFn = null;
  confirmDialog.open = false;
}
