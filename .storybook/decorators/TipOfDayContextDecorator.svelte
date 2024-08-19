<script lang="ts">
  import { setContext } from "svelte";
  import type { Flatpage } from "$lib/api/types";
  const tipOfDay: Flatpage = {
    url: "/tipofday/",
    title: "Tip of the Day",
    content:
      '<p>Welcome to DocumentCloud, the <a href="#">SvelteKit</a> rewrite!</p>',
  };
  setContext("tipOfDay", tipOfDay);
</script>

<slot />
