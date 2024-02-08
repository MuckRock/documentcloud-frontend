<script lang="ts">
  export let data;

  $: searchResults = data.searchResults;
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<div class="container">
  <h1>Document search results:</h1>

  {#await searchResults}
    <p>Loading ...</p>
  {:then results}
    {#each results?.results as document}
      <div class="document">
        <h2>{document.title}</h2>
      </div>
    {:else}
      <p>No results.</p>
    {/each}
  {/await}
</div>
