<script>
  import InternalPage from "./InternalPage";

  export let page;
  export let width;
</script>

{#if page.document != null}
  <InternalPage {page} {width} />
{/if}
