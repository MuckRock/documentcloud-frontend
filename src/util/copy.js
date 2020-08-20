import { pushToast } from "@/manager/toast";

export function copy(elem) {
  // Copy text within an element
  elem.select();
  document.execCommand("copy");

  // Show toast
  pushToast("Copied to clipboard");
}
