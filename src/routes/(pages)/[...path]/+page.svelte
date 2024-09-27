<script lang="ts">
  import Flatpage from "@/lib/components/layouts/Flatpage.svelte";

  export let data;

  $: title = data.data.title;
  $: content = data.data.content;
</script>

<svelte:head>
  <title>{title} | DocumentCloud</title>
</svelte:head>

<Flatpage {title} {content} />
