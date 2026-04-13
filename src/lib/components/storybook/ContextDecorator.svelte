<!-- @component
Decorator component that passes through any arguments as context.
For example, set `embed={true}` to see embed versions of components.
-->
<script lang="ts">
  import { setContext, untrack, type Snippet } from "svelte";

  interface Props {
    children: Snippet;
    [key: string]: any;
  }

  const { children, ...context }: Props = $props();

  for (const [key, value] of Object.entries(untrack(() => context))) {
    setContext(key, value);
  }
</script>

{@render children()}
