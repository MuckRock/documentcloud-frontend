<script>
  import InternalPage from "./InternalPage";

  export let page;
  export let width;
  export let scale;
  export let y;
  export let height;
  export let callback = null;
  export let resizeCallback = () => {};
  export let aspectCallback = () => {};
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
      {aspectCallback}
      {callback} />
  {/if}
</div>
