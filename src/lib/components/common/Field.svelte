<script lang="ts">
  import Flex from "./Flex.svelte";

  export let inline = false;
</script>

<Flex
  direction={inline ? "row" : "column"}
  align={inline ? "center" : "stretch"}
>
  <slot />
  {#if $$slots.help}<div class="help"><slot name="help" /></div>{/if}
</Flex>

<style>
  .help {
    font-size: var(--font-s);
    color: var(--gray-4);
  }
</style>
