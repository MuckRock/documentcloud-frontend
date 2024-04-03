<!-- @component
  Field is a presentational component for displaying inputs.
  It has a slot for displaying styled "help" text,
  for providing more instruction on a field's purpose or meaning.
-->

<script lang="ts">
  import Flex from "$lib/components/common/Flex.svelte";

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
