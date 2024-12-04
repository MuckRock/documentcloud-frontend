import { unwrapFunctionStore, _ } from "svelte-i18n";
import { toast } from "$lib/components/layouts/Toaster.svelte";

export default async function copy(text: string) {
  const $_ = unwrapFunctionStore(_);
  try {
    await navigator.clipboard.writeText(text);
    toast($_("share.copiedToClipboard"));
  } catch {
    toast($_("share.couldNotCopyToClipboard"), { status: "error" });
  }
}
