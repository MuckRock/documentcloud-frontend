<!--
@component
Test wrapper component that provides context for testing components that use getContext.
-->
<script lang="ts">
  import { setContext, untrack } from "svelte";

  interface Props {
    component: any;
    embed?: boolean;
    componentProps?: any;
    [key: string]: any;
  }

  let { component: Component, embed = false, ...rest }: Props = $props();

  // https://svelte.dev/docs/svelte/svelte#untrack
  setContext(
    "embed",
    untrack(() => embed),
  );
</script>

<Component {...rest} />
