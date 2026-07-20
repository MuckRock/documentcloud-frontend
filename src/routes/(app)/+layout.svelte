<script lang="ts">
  import { onMount } from "svelte";

  import AppLayout from "$lib/components/layouts/AppLayout.svelte";

  let { data, children } = $props();

  onMount(async () => {
    if (data.me) {
      const { init } = await import("@plausible-analytics/tracker");
      init({
        domain: "documentcloud.org",
        autoCapturePageviews: true,
      });
    }
  });
</script>

<AppLayout>
  {@render children?.()}
</AppLayout>
