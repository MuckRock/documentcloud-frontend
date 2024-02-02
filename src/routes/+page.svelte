<script>
  export let data;

  $: me = data.me;
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

{#if me}
  <p>The current logged-in user is {me.name}</p>
{/if}
