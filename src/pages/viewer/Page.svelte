<script>
  import InternalPage from "./InternalPage";

  export let page;
  export let width;
  export let scale;
  export let y;
  export let height;
  export let callback = null;
  export let resizeCallback = () => {};
</script>

<style lang="scss">
</style>

<div>
  {#if page.document != null}
    <InternalPage
      {page}
      {width}
      {scale}
      {y}
      {height}
      {resizeCallback}
      {callback}
    />
  {/if}
</div>
