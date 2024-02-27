<script lang="ts">
  import "@/style/kit.css";
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<div class="ui">
  <section class="navigation"></section>

  <main class="content">
    <slot />
  </main>

  <section class="action"></section>
</div>
