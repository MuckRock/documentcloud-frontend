<script>
  import { _ } from "svelte-i18n";
  import { Search16 } from "svelte-octicons";

  export let link = "";
</script>

<div class="link">
  <a href={link} target="_blank">
    <Search16 />
    {$_("searchLink.search")}</a
  >
</div>
<div class="linkcontainer" />

<style>
  .linkcontainer {
    background: white;
    position: absolute;
    top: 0;
    left: -48px;
    right: 0;
    bottom: -11px;
    z-index: -1;
  }

  .link {
    background: var(--faint-gray);
    display: inline-block;
    padding: 4px 19px 4px 11px;
    border-radius: var(--radius);
    border: solid 1px gainsboro;
    margin: 0 -12px;
    color: var(--secondary);
    margin-bottom: 6px;
  }

  .link :global(*) {
    display: inline-block;
    vertical-align: middle;
  }

  .link :global(svg) {
    padding-right: 5px;
    padding-bottom: 1px;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>
