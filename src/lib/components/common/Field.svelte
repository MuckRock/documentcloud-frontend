<!-- @component
  Field is a presentational component for displaying inputs.
  It has a slot for displaying styled "help" text,
  for providing more instruction on a field's purpose or meaning.
-->

<script lang="ts">
  import type { Snippet } from "svelte";

  import Flex from "$lib/components/common/Flex.svelte";

  interface Props {
    inline?: boolean;
    children: Snippet;
    help?: Snippet;
  }

  let { inline = false, children, help }: Props = $props();
</script>

<Flex
  direction={inline ? "row" : "column"}
  align={inline ? "center" : "stretch"}
  wrap={inline}
  gap={0.375}
>
  {@render children()}
  {#if help}<div class="help">{@render help?.()}</div>{/if}
</Flex>

<style>
  .help {
    flex: 1 1 100%;
    font-size: var(--font-xs);
    color: var(--gray-4);
  }
</style>
