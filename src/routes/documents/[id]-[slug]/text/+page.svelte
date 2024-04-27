<script lang="ts">
  import TextPage from "$lib/components/documents/TextPage.svelte";

  export let data;

  $: pages = data.pages;
</script>

<div class="container">
  {#each pages as { page, contents }}
    <TextPage {page} {contents} />
  {/each}
</div>

<style>
  .container {
    display: flex;
    padding: 4.75rem 2rem 0rem 2rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
</style>
