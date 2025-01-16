<script lang="ts">
  import Flatpage from "$lib/components/layouts/Flatpage.svelte";

  export let data;

  $: title = data.title;
  $: content = data.content;
</script>

<svelte:head>
  <title>{title} | DocumentCloud</title>
</svelte:head>

<Flatpage {content} />
