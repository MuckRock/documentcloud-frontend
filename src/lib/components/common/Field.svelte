<script lang="ts">
  import Flex from "./Flex.svelte";

  export let inline = false;
</script>

<Flex
  direction={inline ? "row" : "column"}
  align={inline ? "center" : "stretch"}
  wrap={inline}
>
  <slot />
  {#if $$slots.help}<div class="help"><slot name="help" /></div>{/if}
</Flex>

<style>
  .help {
    flex: 1 1 100%;
    font-size: var(--font-xs);
    color: var(--gray-4);
  }
</style>
