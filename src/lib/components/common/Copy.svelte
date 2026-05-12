<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Copy16 } from "svelte-octicons";

  import Button from "./Button.svelte";

  import copy from "$lib/utils/copy";

  interface Props {
    text: string;
    hideLabel?: boolean;
  }

  let { text, hideLabel = false }: Props = $props();
</script>

<Button
  size="small"
  ghost
  onclick={() => copy(text)}
  disabled={!navigator.clipboard}
>
  <Copy16 height={14} width={14} />
  {#if !hideLabel}{$_("share.copy")}{/if}
</Button>
