<script lang="ts">
  import Flatpage from "$lib/components/layouts/Flatpage.svelte";

  let { data } = $props();

  let title = $derived(data.title);
  let content = $derived(data.content);
</script>

<svelte:head>
  <title>{title} | DocumentCloud</title>
</svelte:head>

<Flatpage {content} />
