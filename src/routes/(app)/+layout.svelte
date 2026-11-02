<script lang="ts">
  import { onMount } from "svelte";

  import AppLayout from "$lib/components/layouts/AppLayout.svelte";
  import { initDocumentQueryState } from "$lib/state/query.svelte";

  let { data, children } = $props();

  initDocumentQueryState();

  onMount(async () => {
    if (data.me && !window.plausible) {
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
