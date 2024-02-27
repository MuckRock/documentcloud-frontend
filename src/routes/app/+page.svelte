<script lang="ts">
  export let data;

  $: searchResults = data.searchResults;

  // local utils

  function path(url: URL | string) {
    url = new URL(url);

    return url.pathname;
  }
</script>
