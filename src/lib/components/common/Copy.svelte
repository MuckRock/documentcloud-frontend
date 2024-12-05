<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Copy16 } from "svelte-octicons";

  import Button from "./Button.svelte";

  import copy from "$lib/utils/copy";

  export let text: string;
  export let hideLabel = false;
</script>

<Button
  size="small"
  ghost
  on:click={() => copy(text)}
  disabled={!navigator.clipboard}
>
  <Copy16 height={14} width={14} />
  {#if !hideLabel}{$_("share.copy")}{/if}
</Button>
