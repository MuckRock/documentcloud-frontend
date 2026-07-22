<script lang="ts">
  import type { Flatpage } from "$lib/api/types";
  import { type Snippet, setContext } from "svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
  const tipOfDay: Flatpage = {
    url: "/tipofday/",
    title: "Tip of the Day",
    content:
      '<p>Welcome to DocumentCloud, the <a href="#">SvelteKit</a> rewrite!</p>',
  };
  setContext("tipOfDay", tipOfDay);
</script>

{@render children?.()}
