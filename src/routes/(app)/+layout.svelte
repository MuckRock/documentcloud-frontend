<script lang="ts">
  import { setContext, onMount } from "svelte";

  import AppLayout from "$lib/components/layouts/AppLayout.svelte";

  // don't destructure props to preserve reactivity
  let props = $props();

  setContext("tipOfDay", props.data.tipOfDay);

  onMount(async () => {
    if (props.data.me) {
      const { init } = await import("@plausible-analytics/tracker");
      init({
        domain: "documentcloud.org",
        autoCapturePageviews: true,
      });
    }
  });
</script>

<AppLayout>
  {@render props.children?.()}
</AppLayout>
