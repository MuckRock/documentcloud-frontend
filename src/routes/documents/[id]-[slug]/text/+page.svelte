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
