<script>
  import Header from "../Header.svelte";

  export let addon;
</script>

<style>
  .container {
    max-width: 32rem;
    margin: 0 auto;
  }
</style>

<div class="container">
  <Header {addon} />
</div>
