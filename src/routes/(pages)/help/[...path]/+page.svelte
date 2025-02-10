<script lang="ts">
  import Flatpage from "$lib/components/layouts/Flatpage.svelte";
  import PlausibleTracker from "$lib/components/common/PlausibleTracker.svelte";

  export let data;

  $: title = data.title;
  $: content = data.content;
</script>

<svelte:head>
  <title>{title} | DocumentCloud</title>
</svelte:head>

<PlausibleTracker>
  <Flatpage {content} />
</PlausibleTracker>
